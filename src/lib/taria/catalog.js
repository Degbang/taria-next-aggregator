import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "./db";
import { tariaConfig } from "./config";

const TRAVEL_POLICY_TYPES = new Set(["travel_insurance", "intercity_travel"]);
const VEHICLE_POLICY_TYPES = new Set([
  "vehicle_insurance",
  "motor_insurance",
  "car_insurance",
  "auto_insurance",
  "intercity_travel",
]);
const HOME_POLICY_TYPES = new Set(["home_insurance", "property_insurance"]);
const DEVICE_POLICY_TYPES = new Set([
  "device_insurance",
  "electronics_insurance",
  "gadget_insurance",
]);

export async function getProducts() {
  if (tariaConfig.productSource === "tripsecure") {
    const remote = await fetchTripsecureProducts();
    if (remote.length > 0) {
      return remote;
    }
  }

  const stored = await prisma.product.findMany({ orderBy: { name: "asc" } });
  if (stored.length > 0) {
    return stored;
  }

  const filePath = join(process.cwd(), "src", "data", "local-products.json");
  const payload = JSON.parse(await readFile(filePath, "utf8"));
  return payload.products.map((product) => ({
    id: product.productId,
    name: product.name,
    insurer: product.insurer,
    category: product.category,
    tags: product.tags,
    supportedPaymentFrequencies: product.supportedPaymentFrequencies,
    minBudgetPercent: product.minBudgetPercent,
    maxBudgetPercent: product.maxBudgetPercent,
    coverageScope: product.coverageScope,
    travelEligible: product.travelEligible,
    deviceProtectionEligible: product.deviceProtectionEligible,
    vehicleEligible: product.vehicleEligible,
    homeEligible: product.homeEligible,
  }));
}

async function fetchTripsecureProducts() {
  try {
    const headers = {};
    if (tariaConfig.tripsecureApiKey) {
      headers[tariaConfig.tripsecureApiKeyHeader] = tariaConfig.tripsecureApiKey;
    }

    const response = await fetch(
      `${tariaConfig.tripsecureBaseUrl}${tariaConfig.tripsecurePolicyPath}`,
      { headers, cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const items = payload?.data?.data || [];

    return items
      .filter((item) => String(item.status || "").toLowerCase() === "approved")
      .map((item) => mapTripsecurePolicy(item))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function mapTripsecurePolicy(policy) {
  const policyType = normalizePolicyType(policy.policyType);
  const tags = [policy.policyType, policy.shortDescription, policy.geography].filter(Boolean);

  return {
    id: policy.slug || crypto.randomUUID(),
    name: policy.policyName || "Unnamed policy",
    insurer: "OTHER",
    category: normalizeCategory(policyType),
    tags,
    supportedPaymentFrequencies: resolvePaymentFrequencies(policy.coverageDurations),
    minBudgetPercent: 2,
    maxBudgetPercent: 10,
    coverageScope: policy.description || policy.shortDescription || "General coverage",
    travelEligible: TRAVEL_POLICY_TYPES.has(policyType),
    deviceProtectionEligible: DEVICE_POLICY_TYPES.has(policyType),
    vehicleEligible: VEHICLE_POLICY_TYPES.has(policyType),
    homeEligible: HOME_POLICY_TYPES.has(policyType),
  };
}

function normalizePolicyType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeCategory(policyType) {
  if (TRAVEL_POLICY_TYPES.has(policyType)) {
    return "Travel Insurance";
  }
  if (VEHICLE_POLICY_TYPES.has(policyType)) {
    return "Vehicle Insurance";
  }
  if (HOME_POLICY_TYPES.has(policyType)) {
    return "Home Insurance";
  }
  if (DEVICE_POLICY_TYPES.has(policyType)) {
    return "Device Insurance";
  }
  return "General Insurance";
}

function resolvePaymentFrequencies(durations) {
  if (!Array.isArray(durations) || durations.length === 0) {
    return ["MONTHLY"];
  }

  const frequencies = new Set();
  for (const duration of durations) {
    const raw = String(duration?.premiumDuration || duration?.displayUnit || "").toLowerCase();
    if (raw.includes("day") || raw.includes("hour")) {
      frequencies.add("DAILY");
    } else if (raw.includes("week")) {
      frequencies.add("WEEKLY");
    } else if (raw.includes("year")) {
      frequencies.add("YEARLY");
    } else {
      frequencies.add("MONTHLY");
    }
  }
  return [...frequencies];
}
