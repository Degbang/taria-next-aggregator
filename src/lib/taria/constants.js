export const ASSET_POLICY = {
  DEVICE_ASSETS: ["SMARTPHONE", "LAPTOP_TABLET"],
  VEHICLE_ASSETS: ["MOTORBIKE", "CAR"],
  HOME_ASSETS: ["HOME_RENTED_APARTMENT"],
};

export const DEFAULT_BUDGET_POLICY = {
  LESS_THAN_2: { min: 0, max: 1 },
  TWO_TO_FIVE: { min: 2, max: 5 },
  SIX_TO_TEN: { min: 6, max: 10 },
  MORE_THAN_TEN: { min: 11, max: 100 },
};

export const RECOMMENDATION_LIMITS = {
  MIN: 1,
  MAX: 4,
};

export const RECOMMENDATION_MESSAGES = {
  SAFE_FALLBACK:
    "Based on your current information, a human insurance advisor review is recommended.",
  AI_UNAVAILABLE: "We could not reach the AI service. Please try again.",
  RULE_BASED_FALLBACK:
    "AI ranking is temporarily unavailable. Showing best-fit recommendations from eligibility rules.",
};

export const ENUMS = {
  employmentIncomeSituation: [
    "FULL_TIME_EMPLOYED",
    "SELF_EMPLOYED",
    "CONTRACT_GIG",
    "STUDENT",
    "UNEMPLOYED_RETIRED",
  ],
  dependentCountRange: ["NONE", "ONE_TO_TWO", "THREE_TO_FOUR", "FIVE_OR_MORE"],
  assetTypes: [
    "SMARTPHONE",
    "LAPTOP_TABLET",
    "MOTORBIKE",
    "CAR",
    "HOME_RENTED_APARTMENT",
    "NONE_OF_THE_ABOVE",
  ],
  travelPattern: ["NO_TRAVEL", "DOMESTIC_TRAVEL", "INTERNATIONAL_TRAVEL"],
  lateNightCommuteFrequency: ["RARELY", "SOMETIMES", "OFTEN", "ALMOST_DAILY"],
  mobilityMode: [
    "WALK_BICYCLE",
    "PUBLIC_TRANSPORT",
    "RIDE_HAILING",
    "PERSONAL_CAR_MOTORBIKE",
    "MIXED",
  ],
  riskyActivityFrequency: ["NEVER", "OCCASIONALLY", "FREQUENTLY", "AS_PART_OF_JOB"],
  belongingsCareLevel: [
    "VERY_CAREFUL",
    "MOSTLY_CAREFUL",
    "SOMETIMES_CARELESS",
    "OFTEN_LOSE_DAMAGE",
  ],
  expensePredictability: [
    "VERY_PREDICTABLE",
    "MOSTLY_PREDICTABLE",
    "SOMETIMES_UNPREDICTABLE",
    "HIGHLY_UNPREDICTABLE",
  ],
  emergencyResponseCapacity: [
    "EASILY_PAY_FROM_SAVINGS",
    "MANAGE_WITH_DIFFICULTY",
    "NEED_TO_BORROW",
    "UNABLE_TO_COPE",
  ],
  paymentPreference: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
  insuranceBudgetPercentRange: ["LESS_THAN_2", "TWO_TO_FIVE", "SIX_TO_TEN", "MORE_THAN_TEN"],
  insuranceExperience: ["NONE", "HAD_POLICY_NEVER_CLAIMED", "HAD_POLICY_CLAIMED"],
  insuranceConcern: [
    "COST",
    "CLAIMS_NOT_PAID",
    "COMPLEXITY_FINE_PRINT",
    "NOT_SEEING_VALUE",
    "NO_CONCERNS",
  ],
  choicePriority: [
    "LOWEST_PRICE",
    "FLEXIBLE_PAYMENTS",
    "FAST_CLAIMS",
    "WIDE_COVERAGE",
    "TRUSTED_BRAND",
  ],
};
