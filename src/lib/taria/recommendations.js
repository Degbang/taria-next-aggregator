import { prisma } from "./db";
import {
  ASSET_POLICY,
  DEFAULT_BUDGET_POLICY,
  RECOMMENDATION_LIMITS,
  RECOMMENDATION_MESSAGES,
} from "./constants";
import { getProducts } from "./catalog";
import { tariaConfig } from "./config";

export async function createAssessment(input) {
  return prisma.assessment.create({ data: input });
}

export async function getAssessmentById(assessmentId) {
  return prisma.assessment.findUnique({ where: { id: assessmentId } });
}

export async function getOrCreateRecommendations(assessmentId) {
  const existing = await prisma.recommendation.findUnique({
    where: { assessmentId },
    include: { items: { orderBy: { rank: "asc" } } },
  });

  if (existing) {
    return toRecommendationResponse(existing);
  }

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    return null;
  }

  const products = await getProducts();
  const strictEligible = filterEligibleStrict(assessment, products);
  let eligible = strictEligible;

  if (eligible.length < RECOMMENDATION_LIMITS.MIN) {
    const relaxedEligible = filterEligibleRelaxed(assessment, products);
    if (relaxedEligible.length > 0) {
      eligible = relaxedEligible;
    }
  }

  if (eligible.length < RECOMMENDATION_LIMITS.MIN) {
    return saveRecommendation(assessmentId, [], RECOMMENDATION_MESSAGES.SAFE_FALLBACK, RECOMMENDATION_MESSAGES.SAFE_FALLBACK);
  }

  const aiItems = await rankWithAi(assessment, eligible);
  const selected =
    aiItems.length > 0
      ? aiItems.slice(0, RECOMMENDATION_LIMITS.MAX)
      : buildRuleBasedFallback(assessment, eligible);

  const message =
    aiItems.length > 0 ? null : RECOMMENDATION_MESSAGES.RULE_BASED_FALLBACK;

  return saveRecommendation(
    assessmentId,
    selected,
    message,
    aiItems.length > 0 ? "AI recommendation generated" : RECOMMENDATION_MESSAGES.RULE_BASED_FALLBACK
  );
}

async function saveRecommendation(assessmentId, items, message, rawPayload) {
  const recommendation = await prisma.recommendation.create({
    data: {
      assessmentId,
      message,
      rawPayload,
      items: {
        create: items.map((item, index) => ({
          productId: item.productId,
          productName: item.productName,
          reason: item.reason,
          rank: item.rank || index + 1,
        })),
      },
    },
    include: { items: { orderBy: { rank: "asc" } } },
  });

  return toRecommendationResponse(recommendation);
}

function toRecommendationResponse(recommendation) {
  return {
    items: recommendation.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      reason: item.reason,
      rank: item.rank,
    })),
    createdAt: recommendation.createdAt,
    message: recommendation.message,
  };
}

function filterEligibleStrict(assessment, products) {
  return products.filter((product) => {
    if (!budgetCompatible(assessment.insuranceBudgetPercentRange, product)) {
      return false;
    }
    const flags = getCoverageFlags(assessment);
    if (!flags.requiresAnyFlag) {
      return true;
    }
    return matchesAnyRequestedFlag(product, flags);
  });
}

function filterEligibleRelaxed(assessment, products) {
  const flags = getCoverageFlags(assessment);

  const budgetCompatibleProducts = products.filter((product) =>
    budgetCompatible(assessment.insuranceBudgetPercentRange, product)
  );

  if (!flags.requiresAnyFlag) {
    return budgetCompatibleProducts;
  }

  return budgetCompatibleProducts.filter((product) => matchesAnyRequestedFlag(product, flags));
}

function budgetCompatible(rangeName, product) {
  const range = DEFAULT_BUDGET_POLICY[rangeName];
  return product.minBudgetPercent <= range.max && product.maxBudgetPercent >= range.min;
}

function getCoverageFlags(assessment) {
  const assets = assessment.assetTypes;
  const requiresTravel = assessment.travelPattern !== "NO_TRAVEL";
  const hasDevice = containsAny(assets, ASSET_POLICY.DEVICE_ASSETS);
  const hasVehicle = containsAny(assets, ASSET_POLICY.VEHICLE_ASSETS);
  const hasHome = containsAny(assets, ASSET_POLICY.HOME_ASSETS);

  return {
    requiresTravel,
    hasDevice,
    hasVehicle,
    hasHome,
    requiresAnyFlag: requiresTravel || hasDevice || hasVehicle || hasHome,
  };
}

function matchesAnyRequestedFlag(product, flags) {
  return (
    (flags.requiresTravel && product.travelEligible) ||
    (flags.hasDevice && product.deviceProtectionEligible) ||
    (flags.hasVehicle && product.vehicleEligible) ||
    (flags.hasHome && product.homeEligible)
  );
}

function containsAny(assets, targets) {
  return targets.some((target) => assets.includes(target));
}

function buildRuleBasedFallback(assessment, products) {
  return scoreProducts(assessment, products)
    .slice(0, RECOMMENDATION_LIMITS.MAX)
    .map((entry, index) => ({
      productId: entry.product.id,
      productName: entry.product.name,
      reason:
        entry.score > 0
          ? "Matches your assessment profile and supports your preferred payment frequency."
          : "Eligible for your current profile and budget constraints.",
      rank: index + 1,
    }));
}

function scoreProducts(assessment, products) {
  const flags = getCoverageFlags(assessment);

  return products
    .map((product) => {
      let score = 0;
      if (product.supportedPaymentFrequencies.includes(assessment.paymentPreference)) {
        score += 3;
      }
      if (flags.requiresTravel && product.travelEligible) {
        score += 2;
      }
      if (flags.hasDevice && product.deviceProtectionEligible) {
        score += 2;
      }
      if (flags.hasVehicle && product.vehicleEligible) {
        score += 2;
      }
      if (flags.hasHome && product.homeEligible) {
        score += 1;
      }
      return { product, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.product.name.localeCompare(right.product.name);
    });
}

async function rankWithAi(assessment, products) {
  if (!tariaConfig.aiApiKey) {
    return [];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(tariaConfig.aiTimeoutMs, 1000));

  try {
    const prompt = buildAiPrompt(assessment, products);
    const response = await fetch(`${tariaConfig.aiBaseUrl.replace(/\/+$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tariaConfig.aiApiKey}`,
      },
      body: JSON.stringify({
        model: tariaConfig.aiModel,
        temperature: tariaConfig.aiTemperature,
        messages: [
          {
            role: "system",
            content:
              "Return strict JSON only. Provide 1 to 4 ranked products with productId, productName, reason, and rank.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(extractJson(content));
    if (!Array.isArray(parsed?.items)) {
      return [];
    }

    return parsed.items
      .filter((item) => item?.productId && item?.productName && item?.reason)
      .map((item, index) => ({
        productId: item.productId,
        productName: item.productName,
        reason: item.reason,
        rank: item.rank || index + 1,
      }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function buildAiPrompt(assessment, products) {
  return JSON.stringify({
    assessment,
    products: products.map((product) => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      tags: product.tags,
      supportedPaymentFrequencies: product.supportedPaymentFrequencies,
      coverageScope: product.coverageScope,
      travelEligible: product.travelEligible,
      deviceProtectionEligible: product.deviceProtectionEligible,
      vehicleEligible: product.vehicleEligible,
      homeEligible: product.homeEligible,
    })),
    instructions: "Rank the best-fit products and explain each choice in one short sentence.",
  });
}

function extractJson(content) {
  const raw = String(content || "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return start >= 0 && end >= 0 ? raw.slice(start, end + 1) : '{"items":[]}';
}
