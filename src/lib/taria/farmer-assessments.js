import { withPgClient } from "./db";
import {
  calculateFarmerRisk,
  farmerQuestionMap,
} from "./farmer-risk";

export async function createFarmerRiskAssessment(input) {
  const answers = normalizeFarmerAnswers(input);
  const context = normalizeFarmerContext(input);
  const questionScores = Object.fromEntries(
    Object.entries(farmerQuestionMap).map(([controlName, question]) => [
      controlName,
      question.getScore(answers[controlName]),
    ])
  );
  const calculation = calculateFarmerRisk(questionScores);
  const assessmentId =
    globalThis.crypto?.randomUUID?.() ??
    `farm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const assessment = await saveFarmerRiskAssessment({
    assessmentId,
    answers,
    context,
    questionScores,
    calculation,
  });

  return toFarmerRiskResponse(assessment, calculation, context);
}

export async function getLatestFarmerRiskAssessment({ externalFarmerId, farmId }) {
  const result = await withPgClient((client) =>
    client.query(
      `
      SELECT
        "id",
        "submittedAt"::text AS "submittedAt",
        "sourceApplication",
        "externalFarmerId",
        "farmId",
        "loanApplicationId",
        "answers"::text AS "answersJson",
        "sectionScores"::text AS "sectionScoresJson",
        "finalScoreRaw",
        "finalScoreDisplay",
        "riskLevel",
        "loanRecommendationTier",
        "loanAmount",
        "insurancePremium",
        to_json("insurancePackage")::text AS "insurancePackageJson"
      FROM "FarmerRiskAssessment"
      WHERE "externalFarmerId" = $1
        AND "farmId" = $2
      ORDER BY "submittedAt" DESC
      LIMIT 1
      `,
      [externalFarmerId.trim(), farmId.trim()]
    )
  );

  return result.rows[0] ? toStoredFarmerRiskResponse(result.rows[0]) : null;
}

export async function listFarmerRiskAssessments(limit = 25) {
  const result = await withPgClient((client) =>
    client.query(
      `
      SELECT
        "id",
        "submittedAt",
        "sourceApplication",
        "externalFarmerId",
        "farmId",
        "loanApplicationId",
        "answers",
        "questionScores",
        "sectionScores",
          "finalScoreRaw",
          "finalScoreDisplay",
          "riskLevel",
          "loanRecommendationTier",
          "loanAmount",
          "insurancePremium",
          "insurancePackage"
        FROM "FarmerRiskAssessment"
        ORDER BY "submittedAt" DESC
        LIMIT $1
      `,
      [Math.max(1, Math.min(limit, 100))]
    )
  );

  return result.rows;
}

function normalizeFarmerAnswers(input) {
  return Object.fromEntries(
    Object.entries(farmerQuestionMap).map(([controlName, question]) => {
      const value = input[controlName];
      return [
        controlName,
        question.inputType === "number" ? Number(value) : value,
      ];
    })
  );
}

function normalizeFarmerContext(input) {
  return {
    sourceApplication: input.sourceApplication?.trim() || null,
    externalFarmerId: input.externalFarmerId?.trim() || null,
    farmId: input.farmId?.trim() || null,
    loanApplicationId: input.loanApplicationId?.trim() || null,
  };
}

function toFarmerRiskResponse(assessment, calculation, context) {
  return {
    assessmentId: assessment.id,
    submittedAt: assessment.submittedAt,
    persisted: assessment.persisted ?? true,
    context: {
      sourceApplication: assessment.sourceApplication ?? context.sourceApplication,
      externalFarmerId: assessment.externalFarmerId ?? context.externalFarmerId,
      farmId: assessment.farmId ?? context.farmId,
      loanApplicationId: assessment.loanApplicationId ?? context.loanApplicationId,
    },
    result: {
      score: calculation.finalScoreDisplay,
      rawScore: calculation.finalScoreRaw,
      riskLevel: calculation.riskLevel,
      loanRecommendationTier: calculation.loanRecommendationTier,
      loanAmount: calculation.loanAmount,
      insurancePremium: calculation.insurancePremium,
      insurancePackage: calculation.insurancePackage,
      sectionScores: calculation.sectionScoresDisplay,
    },
  };
}

async function saveFarmerRiskAssessment({ assessmentId, answers, context, questionScores, calculation }) {
  const values = [
    assessmentId,
    context.sourceApplication,
    context.externalFarmerId,
    context.farmId,
    context.loanApplicationId,
    JSON.stringify(answers),
    JSON.stringify(questionScores),
    JSON.stringify(calculation.sectionScoresRaw),
    calculation.finalScoreRaw,
    calculation.finalScoreDisplay,
    calculation.riskLevel,
    calculation.loanRecommendationTier,
    calculation.loanAmount,
    calculation.insurancePremium,
    calculation.insurancePackage,
  ];

  const result = await withPgClient((client) =>
    client.query(
      `
        WITH existing AS (
          SELECT "id"
          FROM "FarmerRiskAssessment"
          WHERE "externalFarmerId" = $3
            AND "farmId" = $4
          ORDER BY "submittedAt" DESC
          LIMIT 1
        ),
        updated AS (
          UPDATE "FarmerRiskAssessment"
          SET
            "submittedAt" = NOW(),
            "sourceApplication" = $2,
            "loanApplicationId" = $5,
            "answers" = $6::jsonb,
            "questionScores" = $7::jsonb,
            "sectionScores" = $8::jsonb,
            "finalScoreRaw" = $9,
            "finalScoreDisplay" = $10,
            "riskLevel" = $11,
            "loanRecommendationTier" = $12,
            "loanAmount" = $13,
            "insurancePremium" = $14,
            "insurancePackage" = $15::text[]
          WHERE "id" = (SELECT "id" FROM existing)
          RETURNING "id", "submittedAt", "sourceApplication", "externalFarmerId", "farmId", "loanApplicationId"
        ),
        inserted AS (
          INSERT INTO "FarmerRiskAssessment" (
            "id",
            "sourceApplication",
            "externalFarmerId",
            "farmId",
            "loanApplicationId",
            "answers",
            "questionScores",
            "sectionScores",
            "finalScoreRaw",
            "finalScoreDisplay",
            "riskLevel",
            "loanRecommendationTier",
            "loanAmount",
            "insurancePremium",
            "insurancePackage"
          )
          SELECT
            $1,
            $2,
            $3,
            $4,
            $5,
            $6::jsonb,
            $7::jsonb,
            $8::jsonb,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15::text[]
          WHERE NOT EXISTS (SELECT 1 FROM updated)
          RETURNING "id", "submittedAt", "sourceApplication", "externalFarmerId", "farmId", "loanApplicationId"
        )
        SELECT * FROM updated
        UNION ALL
        SELECT * FROM inserted
        LIMIT 1
      `,
      values
    )
  );

  return {
    id: result.rows[0].id,
    submittedAt: result.rows[0].submittedAt,
    sourceApplication: result.rows[0].sourceApplication,
    externalFarmerId: result.rows[0].externalFarmerId,
    farmId: result.rows[0].farmId,
    loanApplicationId: result.rows[0].loanApplicationId,
    persisted: true,
  };
}

function toStoredFarmerRiskResponse(assessment) {
  const parseJson = (value, fallback) => {
    if (typeof value !== "string") {
      return value ?? fallback;
    }

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  return {
    assessmentId: assessment.id,
    submittedAt: assessment.submittedAt,
    persisted: true,
    context: {
      sourceApplication: assessment.sourceApplication,
      externalFarmerId: assessment.externalFarmerId,
      farmId: assessment.farmId,
      loanApplicationId: assessment.loanApplicationId,
    },
    answers: parseJson(assessment.answersJson, {}),
    result: {
      score: assessment.finalScoreDisplay,
      rawScore: assessment.finalScoreRaw,
      riskLevel: assessment.riskLevel,
      loanRecommendationTier: assessment.loanRecommendationTier,
      loanAmount: assessment.loanAmount,
      insurancePremium: assessment.insurancePremium,
      insurancePackage: parseJson(assessment.insurancePackageJson, []),
      sectionScores: normalizeSectionScores(parseJson(assessment.sectionScoresJson, {})),
    },
  };
}

function normalizeSectionScores(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).map(([label, score]) => ({ label, value: score }));
  }

  return [];
}
