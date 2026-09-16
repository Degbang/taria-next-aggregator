import { NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/taria/recommendations";
import { enforceAssessmentSession } from "@/lib/taria/security";

export async function GET(request, context) {
  const { assessmentId } = await context.params;
  const blocked = await enforceAssessmentSession(request, assessmentId, { allowApiKey: true });
  if (blocked) return blocked;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    return NextResponse.json(
      { message: "Assessment not found.", timestamp: new Date().toISOString() },
      { status: 404 }
    );
  }

  return NextResponse.json({
    assessmentId: assessment.id,
    submittedAt: assessment.submittedAt,
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
  });
}
