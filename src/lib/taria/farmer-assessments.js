import { prisma } from "./db";
import {
  calculateFarmerRisk,
  farmerQuestionMap,
} from "./farmer-risk";

export async function createFarmerRiskAssessment(input) {
  const answers = normalizeFarmerAnswers(input);
  const questionScores = Object.fromEntries(
    Object.entries(farmerQuestionMap).map(([controlName, question]) => [
      controlName,
      question.getScore(answers[controlName]),
    ])
  );
  const calculation = calculateFarmerRisk(questionScores);

  const assessment = await prisma.farmerRiskAssessment.create({
    data: {
      answers,
      questionScores,
      sectionScores: calculation.sectionScoresRaw,
      finalScoreRaw: calculation.finalScoreRaw,
      finalScoreDisplay: calculation.finalScoreDisplay,
      riskLevel: calculation.riskLevel,
      loanRecommendationTier: calculation.loanRecommendationTier,
      loanAmount: calculation.loanAmount,
      insurancePremium: calculation.insurancePremium,
      insurancePackage: calculation.insurancePackage,
    },
  });

  return toFarmerRiskResponse(assessment, calculation);
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

function toFarmerRiskResponse(assessment, calculation) {
  return {
    assessmentId: assessment.id,
    submittedAt: assessment.submittedAt,
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
