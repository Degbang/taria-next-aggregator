import { NextResponse } from "next/server";
import { listFarmerRiskAssessments } from "@/lib/taria/farmer-assessments";
import { enforceRecordsSecurity } from "@/lib/taria/security";

export async function GET(request) {
  const blocked = enforceRecordsSecurity(request);
  if (blocked) {
    return blocked;
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 25);
  const records = await listFarmerRiskAssessments(limit);

  return NextResponse.json({
    count: records.length,
    items: records.map((assessment) => ({
      assessmentId: assessment.id,
      submittedAt: assessment.submittedAt,
      answers: assessment.answers,
      questionScores: assessment.questionScores,
      sectionScores: assessment.sectionScores,
      result: {
        score: assessment.finalScoreDisplay,
        rawScore: assessment.finalScoreRaw,
        riskLevel: assessment.riskLevel,
        loanRecommendationTier: assessment.loanRecommendationTier,
        loanAmount: assessment.loanAmount,
        insurancePremium: assessment.insurancePremium,
        insurancePackage: assessment.insurancePackage,
      },
    })),
  });
}
