import { NextResponse } from "next/server";
import { listAssessments } from "@/lib/taria/recommendations";
import { enforceRecordsSecurity } from "@/lib/taria/security";

export async function GET(request) {
  const blocked = enforceRecordsSecurity(request);
  if (blocked) {
    return blocked;
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 25);
  const records = await listAssessments(limit);

  return NextResponse.json({
    count: records.length,
    items: records.map((assessment) => ({
      assessmentId: assessment.id,
      submittedAt: assessment.submittedAt,
      profile: {
        employmentIncomeSituation: assessment.employmentIncomeSituation,
        dependentCountRange: assessment.dependentCountRange,
        assetTypes: assessment.assetTypes,
        travelPattern: assessment.travelPattern,
        lateNightCommuteFrequency: assessment.lateNightCommuteFrequency,
        mobilityMode: assessment.mobilityMode,
        riskyActivityFrequency: assessment.riskyActivityFrequency,
        belongingsCareLevel: assessment.belongingsCareLevel,
        expensePredictability: assessment.expensePredictability,
        emergencyResponseCapacity: assessment.emergencyResponseCapacity,
        paymentPreference: assessment.paymentPreference,
        insuranceBudgetPercentRange: assessment.insuranceBudgetPercentRange,
        insuranceExperience: assessment.insuranceExperience,
        insuranceConcern: assessment.insuranceConcern,
        choicePriority: assessment.choicePriority,
      },
      recommendation: assessment.recommendation
        ? {
            createdAt: assessment.recommendation.createdAt,
            message: assessment.recommendation.message,
            items: assessment.recommendation.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              reason: item.reason,
              rank: item.rank,
            })),
          }
        : null,
    })),
  });
}
