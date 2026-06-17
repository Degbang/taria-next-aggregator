import { z } from "zod";
import { ENUMS } from "./constants";

export const assessmentSchema = z.object({
  employmentIncomeSituation: z.enum(ENUMS.employmentIncomeSituation),
  dependentCountRange: z.enum(ENUMS.dependentCountRange),
  assetTypes: z.array(z.enum(ENUMS.assetTypes)).min(1),
  travelPattern: z.enum(ENUMS.travelPattern),
  lateNightCommuteFrequency: z.enum(ENUMS.lateNightCommuteFrequency),
  mobilityMode: z.enum(ENUMS.mobilityMode),
  riskyActivityFrequency: z.enum(ENUMS.riskyActivityFrequency),
  belongingsCareLevel: z.enum(ENUMS.belongingsCareLevel),
  expensePredictability: z.enum(ENUMS.expensePredictability),
  emergencyResponseCapacity: z.enum(ENUMS.emergencyResponseCapacity),
  paymentPreference: z.enum(ENUMS.paymentPreference),
  insuranceBudgetPercentRange: z.enum(ENUMS.insuranceBudgetPercentRange),
  insuranceExperience: z.enum(ENUMS.insuranceExperience),
  insuranceConcern: z.enum(ENUMS.insuranceConcern),
  choicePriority: z.enum(ENUMS.choicePriority),
});

export function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
}
