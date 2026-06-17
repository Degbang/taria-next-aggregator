function createSelectQuestion(controlName, number, label, options, helpText) {
  return {
    controlName,
    number,
    label,
    inputType: "select",
    options,
    helpText,
    getScore: (value) => options.find((option) => option.value === value)?.score ?? 0,
  };
}

function createNumberQuestion(
  controlName,
  number,
  label,
  placeholder,
  helpText,
  scorer,
  step = 0.1,
  min = 0
) {
  return {
    controlName,
    number,
    label,
    inputType: "number",
    helpText,
    placeholder,
    step,
    min,
    getScore: (value) => {
      const numericValue =
        typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
      return Number.isFinite(numericValue) ? scorer(numericValue) : 0;
    },
  };
}

function scoreFarmSizeAcres(value) {
  if (value >= 0.86) {
    return 90;
  }
  if (value >= 0.71) {
    return 75;
  }
  if (value >= 0.6) {
    return 60;
  }
  return 40;
}

function scoreAverageYieldPerAcre(value) {
  if (value > 18) {
    return 95;
  }
  if (value >= 12) {
    return 75;
  }
  if (value >= 6) {
    return 50;
  }
  return 30;
}

const IRRIGATION_ACCESS_OPTIONS = [
  { value: "FULL", label: "Full irrigation", score: 100 },
  { value: "PARTIAL", label: "Partial irrigation", score: 60 },
  { value: "NONE", label: "No irrigation", score: 30 },
];

const RAINFALL_HISTORY_OPTIONS = [
  { value: "CONSISTENT", label: "Consistent and adequate", score: 90 },
  { value: "MIXED", label: "Sometimes too much or too little", score: 60 },
  { value: "UNSTABLE", label: "Often drought or flooding", score: 30 },
];

const DROUGHT_FLOOD_HISTORY_OPTIONS = [
  { value: "NONE", label: "No", score: 90 },
  { value: "ONCE", label: "Once", score: 60 },
  { value: "MULTIPLE", label: "More than once", score: 30 },
];

const PEST_FREQUENCY_OPTIONS = [
  { value: "RARELY", label: "Rarely", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "OFTEN", label: "Often", score: 30 },
];

const DISEASE_CONTROL_OPTIONS = [
  { value: "REGULAR", label: "Yes (regularly and correctly)", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "NONE", label: "No", score: 30 },
];

const CROP_EXTENSION_SUPPORT_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 40 },
];

const SEED_TYPE_OPTIONS = [
  { value: "IMPROVED", label: "Improved or hybrid seeds", score: 90 },
  { value: "LOCAL", label: "Local seeds", score: 50 },
];

const FERTILIZER_APPLICATION_OPTIONS = [
  { value: "PROPER", label: "Properly (recommended quantity and timing)", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "LOW", label: "Rarely or none", score: 30 },
];

const FARM_MANAGEMENT_OPTIONS = [
  { value: "GOOD", label: "Good", score: 90 },
  { value: "AVERAGE", label: "Average", score: 60 },
  { value: "POOR", label: "Poor", score: 30 },
];

const GUARANTEED_BUYER_OPTIONS = [
  { value: "TRIPSECURE", label: "Yes (TripSecure / contract buyer)", score: 100 },
  { value: "AGGREGATOR", label: "Yes (local aggregator)", score: 70 },
  { value: "OPEN_MARKET", label: "No (sell in open market)", score: 40 },
];

const TRANSPORT_METHOD_OPTIONS = [
  { value: "ORGANIZED", label: "Organized transport (truck / fast delivery)", score: 90 },
  { value: "BASIC", label: "Basic transport", score: 60 },
  { value: "UNRELIABLE", label: "No reliable transport", score: 30 },
];

const PRICE_STABILITY_OPTIONS = [
  { value: "STABLE", label: "Mostly stable", score: 90 },
  { value: "FLUCTUATING", label: "Sometimes fluctuate", score: 60 },
  { value: "UNSTABLE", label: "Very unstable", score: 30 },
];

const LOCATION_RISK_OPTIONS = [
  { value: "FAVORABLE_ZONE", label: "Favorable rainfall and soil zone", score: 90 },
  { value: "MODERATE_ZONE", label: "Moderate rainfall and soil zone", score: 70 },
  { value: "HIGH_RISK_ZONE", label: "High-risk or unverified zone", score: 40 },
];

const NEAR_WATER_SOURCE_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 50 },
];

const YIELD_CONSISTENCY_OPTIONS = [
  { value: "VERY_CONSISTENT", label: "Very consistent", score: 90 },
  { value: "SOMETIMES_FLUCTUATES", label: "Sometimes fluctuates", score: 60 },
  { value: "VERY_INCONSISTENT", label: "Very inconsistent", score: 30 },
];

const COMPLETE_CROP_FAILURE_OPTIONS = [
  { value: "NONE", label: "No", score: 90 },
  { value: "ONCE", label: "Once", score: 60 },
  { value: "MORE_THAN_ONCE", label: "More than once", score: 30 },
];

const FERTILIZER_USAGE_OPTIONS = [
  { value: "PROPER", label: "Yes, properly (correct type, timing, quantity)", score: 90 },
  { value: "INCONSISTENT", label: "Yes, but not consistent", score: 60 },
  { value: "VERY_LOW", label: "No / very little", score: 30 },
];

const FERTILIZER_FREQUENCY_OPTIONS = [
  { value: "RECOMMENDED", label: "2-3 times (recommended)", score: 90 },
  { value: "ONCE", label: "Once", score: 60 },
  { value: "NONE", label: "None", score: 30 },
];

const IRRIGATION_FREQUENCY_OPTIONS = [
  { value: "REGULAR", label: "Yes, regularly", score: 95 },
  { value: "OCCASIONAL", label: "Occasionally", score: 65 },
  { value: "NONE", label: "No", score: 30 },
];

const WATER_SOURCE_OPTIONS = [
  { value: "BOREHOLE", label: "Borehole / irrigation system", score: 90 },
  { value: "RIVER", label: "River / stream", score: 70 },
  { value: "RAIN_FED", label: "Rain-fed only", score: 40 },
];

const PEST_CONTROL_OPTIONS = [
  { value: "REGULAR", label: "Regularly (preventive schedule)", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "RARELY", label: "Rarely / never", score: 30 },
];

const RESISTANT_VARIETY_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 50 },
];

const PRIOR_PEST_IMPACT_OPTIONS = [
  { value: "NONE", label: "No", score: 90 },
  { value: "OCCASIONAL", label: "Occasionally", score: 60 },
  { value: "FREQUENT", label: "Frequently", score: 30 },
];

const EXTENSION_SUPPORT_OPTIONS = [
  { value: "REGULAR", label: "Yes, regularly", score: 90 },
  { value: "OCCASIONAL", label: "Occasionally", score: 60 },
  { value: "NONE", label: "No", score: 40 },
];

const RECOMMENDED_PRACTICES_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "NO", label: "No", score: 30 },
];

const DROUGHT_HISTORY_OPTIONS = [
  { value: "NONE", label: "No", score: 90 },
  { value: "ONCE", label: "Once", score: 60 },
  { value: "MULTIPLE", label: "More than once", score: 30 },
];

const DROUGHT_IMPACT_OPTIONS = [
  { value: "LOW", label: "No major impact", score: 90 },
  { value: "MODERATE", label: "Moderate yield reduction", score: 60 },
  { value: "SEVERE", label: "Severe crop loss", score: 30 },
];

const FLOOD_PRONE_OPTIONS = [
  { value: "NO", label: "No", score: 90 },
  { value: "OCCASIONAL", label: "Occasionally", score: 60 },
  { value: "FREQUENT", label: "Frequently", score: 30 },
];

const FLOOD_HISTORY_OPTIONS = [
  { value: "NO", label: "No", score: 90 },
  { value: "ONCE", label: "Once", score: 60 },
  { value: "MULTIPLE", label: "Multiple times", score: 30 },
];

const SOIL_QUALITY_OPTIONS = [
  { value: "FERTILE", label: "Fertile (loamy, dark, good drainage)", score: 90 },
  { value: "AVERAGE", label: "Average", score: 60 },
  { value: "POOR", label: "Poor (sandy/clay, low fertility)", score: 30 },
];

const SOIL_IMPROVEMENT_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "SOMETIMES", label: "Sometimes", score: 60 },
  { value: "NO", label: "No", score: 30 },
];

const GPS_VERIFICATION_OPTIONS = [
  { value: "VERIFIED", label: "Yes (captured on TARIA)", score: 95 },
  { value: "PARTIAL", label: "Partially verified", score: 70 },
  { value: "NONE", label: "Not verified", score: 40 },
];

const FARMING_ZONE_OPTIONS = [
  { value: "VALIDATED", label: "Yes (validated farming cluster)", score: 90 },
  { value: "UNKNOWN", label: "Unknown area", score: 60 },
  { value: "HIGH_RISK", label: "High-risk / unverified zone", score: 40 },
];

const PAST_CROP_FAILURE_OPTIONS = [
  { value: "NONE", label: "No", score: 95 },
  { value: "ONCE", label: "Yes (once)", score: 60 },
  { value: "MULTIPLE", label: "Yes (more than once)", score: 30 },
];

const AFFECTED_SEASONS_OPTIONS = [
  { value: "NONE", label: "None", score: 95 },
  { value: "ONE", label: "1 season", score: 70 },
  { value: "MULTIPLE", label: "2+ seasons", score: 40 },
];

const CROP_LOSS_PERCENT_OPTIONS = [
  { value: "LOW", label: "<20%", score: 90 },
  { value: "MID", label: "20-50%", score: 60 },
  { value: "HIGH", label: ">50%", score: 30 },
];

const REPAYMENT_IMPACT_OPTIONS = [
  { value: "NO", label: "No", score: 90 },
  { value: "SLIGHTLY", label: "Slightly", score: 60 },
  { value: "SIGNIFICANT", label: "Yes, significantly", score: 30 },
];

const LOSS_CAUSE_OPTIONS = [
  { value: "WEATHER", label: "Weather (drought/flood)", score: 70 },
  { value: "PEST", label: "Pest/disease", score: 60 },
  { value: "PRACTICES", label: "Poor farming practices", score: 40 },
  { value: "UNKNOWN", label: "Unknown", score: 30 },
];

const PREVENTABLE_LOSS_OPTIONS = [
  { value: "NO", label: "No", score: 90 },
  { value: "PARTIAL", label: "Partially", score: 60 },
  { value: "YES", label: "Yes", score: 30 },
];

const RECOVERY_OPTIONS = [
  { value: "FULL", label: "Fully recovered (next season successful)", score: 90 },
  { value: "PARTIAL", label: "Partially recovered", score: 60 },
  { value: "STRUGGLED", label: "Struggled to recover", score: 30 },
];

const ALTERNATIVE_INCOME_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 40 },
];

const PRIOR_INSURANCE_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 50 },
];

const INSURANCE_HELP_OPTIONS = [
  { value: "YES", label: "Yes", score: 90 },
  { value: "NO", label: "No", score: 60 },
  { value: "NOT_APPLICABLE", label: "Not applicable", score: 50 },
];

export const farmerQuestionSteps = [
  {
    stepNumber: 1,
    domainTitle: "Crop Risk",
    areaTitle: "Climate Risk Questions",
    description: "Climate exposure for the selected farm profile.",
    formula: "Climate Score = (Q1 x 0.3) + (Q2 x 0.4) + (Q3 x 0.3)",
    questions: [
      createSelectQuestion("irrigationAccess", "Q1", "Do you have access to irrigation?", IRRIGATION_ACCESS_OPTIONS),
      createSelectQuestion(
        "rainfallHistory",
        "Q2",
        "How was rainfall in your area over the last 3 seasons?",
        RAINFALL_HISTORY_OPTIONS
      ),
      createSelectQuestion(
        "droughtFloodHistory",
        "Q3",
        "Has your farm experienced drought or flooding in the last 2 years?",
        DROUGHT_FLOOD_HISTORY_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 2,
    domainTitle: "Crop Risk",
    areaTitle: "Pest & Disease Risk Questions",
    description: "Pest and disease exposure for the crop itself.",
    formula: "Pest Score = (Q4 x 0.4) + (Q5 x 0.4) + (Q6 x 0.2)",
    questions: [
      createSelectQuestion(
        "pestFrequency",
        "Q4",
        "How often do pests or diseases affect your crops?",
        PEST_FREQUENCY_OPTIONS
      ),
      createSelectQuestion(
        "diseaseControl",
        "Q5",
        "Do you regularly apply pesticides or disease control?",
        DISEASE_CONTROL_OPTIONS
      ),
      createSelectQuestion(
        "cropExtensionSupport",
        "Q6",
        "Do you receive support from an extension officer?",
        CROP_EXTENSION_SUPPORT_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 3,
    domainTitle: "Crop Risk",
    areaTitle: "Input & Farm Practices",
    description: "Seed, fertilizer, and day-to-day crop care.",
    formula: "Input Score = (Q7 x 0.3) + (Q8 x 0.3) + (Q9 x 0.4)",
    questions: [
      createSelectQuestion("seedType", "Q7", "What type of seeds do you use?", SEED_TYPE_OPTIONS),
      createSelectQuestion(
        "fertilizerApplication",
        "Q8",
        "How do you apply fertilizer?",
        FERTILIZER_APPLICATION_OPTIONS
      ),
      createSelectQuestion(
        "farmManagement",
        "Q9",
        "How would you rate your farm management (weeding, spacing, care)?",
        FARM_MANAGEMENT_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 4,
    domainTitle: "Crop Risk",
    areaTitle: "Market Risk Questions",
    description: "Buyer access, logistics, and local crop price stability.",
    formula: "Market Score = (Q10 x 0.5) + (Q11 x 0.2) + (Q12 x 0.3)",
    questions: [
      createSelectQuestion(
        "guaranteedBuyer",
        "Q10",
        "Do you have a guaranteed buyer for your crops?",
        GUARANTEED_BUYER_OPTIONS
      ),
      createSelectQuestion(
        "transportMethod",
        "Q11",
        "How do you usually transport your crops after harvest?",
        TRANSPORT_METHOD_OPTIONS
      ),
      createSelectQuestion(
        "priceStability",
        "Q12",
        "How stable are crop prices in your area?",
        PRICE_STABILITY_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 5,
    domainTitle: "Farm Size Risk",
    areaTitle: "Farm Size Question",
    description: "Smallholder size score for the farm-size domain.",
    formula: "Size Score bands: 0.6-0.7 = 60, 0.71-0.85 = 75, 0.86-1.0 = 90",
    questions: [
      createNumberQuestion(
        "farmSizeAcres",
        "BQ1",
        "What is your farm size (acres)?",
        "0.8",
        "This falls under Farm Size Risk / Farm Size Question.",
        scoreFarmSizeAcres
      ),
    ],
  },
  {
    stepNumber: 6,
    domainTitle: "Farm Size Risk",
    areaTitle: "Farm Location Questions",
    description: "Location quality and water proximity for the smallholder score.",
    formula: "Location Score = (BQ1 x 0.6) + (BQ2 x 0.4)",
    questions: [
      createSelectQuestion(
        "locationRiskZone",
        "BQ1",
        "Where is your farm located? (District/Community risk zone)",
        LOCATION_RISK_OPTIONS,
        "Backend can later map district/community to rainfall and soil risk."
      ),
      createSelectQuestion(
        "nearWaterSource",
        "BQ2",
        "Is your farm close to a water source?",
        NEAR_WATER_SOURCE_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 7,
    domainTitle: "Farm Size Risk",
    areaTitle: "Past Production History",
    description: "Yield history is the most important sub-area in the farm-size domain.",
    formula: "Yield Score = (CQ1 x 0.5) + (CQ2 x 0.3) + (CQ3 x 0.2)",
    questions: [
      createNumberQuestion(
        "averageYieldPerAcre",
        "CQ1",
        "What was your average yield in the last 2-3 seasons (tons per acre)?",
        "14",
        "Bands: >18 = 95, 12-18 = 75, 6-11 = 50, below 6 = 30.",
        scoreAverageYieldPerAcre,
        1
      ),
      createSelectQuestion(
        "yieldConsistency",
        "CQ2",
        "How consistent were your yields over the last 3 seasons?",
        YIELD_CONSISTENCY_OPTIONS
      ),
      createSelectQuestion(
        "completeCropFailure",
        "CQ3",
        "Have you ever had a complete crop failure?",
        COMPLETE_CROP_FAILURE_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 8,
    domainTitle: "Input & Practices Risk",
    areaTitle: "Fertilizer Usage",
    description: "Fertilizer use and frequency under inputs and farming practices.",
    formula: "Fertilizer Score = (DQ1 x 0.6) + (DQ2 x 0.4)",
    questions: [
      createSelectQuestion("fertilizerUsage", "DQ1", "Do you apply fertilizer to your farm?", FERTILIZER_USAGE_OPTIONS),
      createSelectQuestion(
        "fertilizerFrequency",
        "DQ2",
        "How many times do you apply fertilizer per season?",
        FERTILIZER_FREQUENCY_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 9,
    domainTitle: "Input & Practices Risk",
    areaTitle: "Irrigation",
    description: "Irrigation consistency and source quality.",
    formula: "Irrigation Score = (EQ1 x 0.6) + (EQ2 x 0.4)",
    questions: [
      createSelectQuestion("irrigationFrequency", "EQ1", "Do you irrigate your crops?", IRRIGATION_FREQUENCY_OPTIONS),
      createSelectQuestion("mainWaterSource", "EQ2", "What is your main water source?", WATER_SOURCE_OPTIONS),
    ],
  },
  {
    stepNumber: 10,
    domainTitle: "Input & Practices Risk",
    areaTitle: "Pest & Disease Management",
    description: "Pest prevention and crop variety resilience.",
    formula: "Pest Score = (FQ1 x 0.4) + (FQ2 x 0.3) + (FQ3 x 0.3)",
    questions: [
      createSelectQuestion(
        "pestControlFrequency",
        "FQ1",
        "How often do you spray or control pests/diseases?",
        PEST_CONTROL_OPTIONS
      ),
      createSelectQuestion(
        "resistantVarieties",
        "FQ2",
        "Do you use improved or resistant crop varieties?",
        RESISTANT_VARIETY_OPTIONS
      ),
      createSelectQuestion(
        "priorPestImpact",
        "FQ3",
        "Have pests/diseases significantly affected your farm before?",
        PRIOR_PEST_IMPACT_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 11,
    domainTitle: "Input & Practices Risk",
    areaTitle: "Extension Support",
    description: "Support and compliance with recommended farming practices.",
    formula: "Extension Score = (GQ1 x 0.5) + (GQ2 x 0.5)",
    questions: [
      createSelectQuestion(
        "extensionSupport",
        "GQ1",
        "Do you receive support from an extension officer (e.g., MoFA)?",
        EXTENSION_SUPPORT_OPTIONS
      ),
      createSelectQuestion(
        "recommendedPractices",
        "GQ2",
        "Do you follow recommended farming practices?",
        RECOMMENDED_PRACTICES_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 12,
    domainTitle: "Weather & Climate Risk",
    areaTitle: "Past Drought Risk",
    description: "Recent drought frequency and severity.",
    formula: "Drought Score = (HQ1 x 0.5) + (HQ2 x 0.5)",
    questions: [
      createSelectQuestion(
        "droughtHistory",
        "HQ1",
        "Has your farm experienced drought in the past 3 years?",
        DROUGHT_HISTORY_OPTIONS
      ),
      createSelectQuestion("droughtImpact", "HQ2", "How severe was the drought impact?", DROUGHT_IMPACT_OPTIONS),
    ],
  },
  {
    stepNumber: 13,
    domainTitle: "Weather & Climate Risk",
    areaTitle: "Flood Risk",
    description: "Flood exposure and flood-loss history.",
    formula: "Flood Score = (IQ1 x 0.5) + (IQ2 x 0.5)",
    questions: [
      createSelectQuestion(
        "floodProneArea",
        "IQ1",
        "Is your farm located in a flood-prone area?",
        FLOOD_PRONE_OPTIONS
      ),
      createSelectQuestion("floodingHistory", "IQ2", "Has flooding affected your farm before?", FLOOD_HISTORY_OPTIONS),
    ],
  },
  {
    stepNumber: 14,
    domainTitle: "Weather & Climate Risk",
    areaTitle: "Soil Quality",
    description: "Soil condition and soil-improvement effort.",
    formula: "Soil Score = (JQ1 x 0.6) + (JQ2 x 0.4)",
    questions: [
      createSelectQuestion("soilQuality", "JQ1", "How would you describe your soil?", SOIL_QUALITY_OPTIONS),
      createSelectQuestion(
        "soilImprovement",
        "JQ2",
        "Do you apply soil improvement practices (manure, compost)?",
        SOIL_IMPROVEMENT_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 15,
    domainTitle: "Weather & Climate Risk",
    areaTitle: "GPS Verification",
    description: "Verification quality for lenders and insurers.",
    formula: "GPS Score = (KQ1 x 0.6) + (KQ2 x 0.4)",
    questions: [
      createSelectQuestion(
        "gpsVerification",
        "KQ1",
        "Is the farm GPS verified on the platform?",
        GPS_VERIFICATION_OPTIONS
      ),
      createSelectQuestion(
        "farmingZoneValidation",
        "KQ2",
        "Is the farm located in a known farming zone?",
        FARMING_ZONE_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 16,
    domainTitle: "Past Loss Risk",
    areaTitle: "Crop Failure History",
    description: "Frequency and spread of recent crop failure.",
    formula: "Failure Score = (LQ1 x 0.6) + (LQ2 x 0.4)",
    questions: [
      createSelectQuestion(
        "pastCropFailure",
        "LQ1",
        "Have you experienced crop failure in the past 3 years?",
        PAST_CROP_FAILURE_OPTIONS
      ),
      createSelectQuestion("affectedSeasons", "LQ2", "How many seasons were affected?", AFFECTED_SEASONS_OPTIONS),
    ],
  },
  {
    stepNumber: 17,
    domainTitle: "Past Loss Risk",
    areaTitle: "Severity of Loss",
    description: "How much was lost and how hard repayment was affected.",
    formula: "Severity Score = (MQ1 x 0.5) + (MQ2 x 0.5)",
    questions: [
      createSelectQuestion(
        "cropLossPercent",
        "MQ1",
        "What percentage of your crop did you lose?",
        CROP_LOSS_PERCENT_OPTIONS
      ),
      createSelectQuestion(
        "repaymentImpact",
        "MQ2",
        "Did the loss affect your ability to repay loans or reinvest?",
        REPAYMENT_IMPACT_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 18,
    domainTitle: "Past Loss Risk",
    areaTitle: "Cause of Loss",
    description: "Separate insurable events from preventable behavior.",
    formula: "Cause Score = (NQ1 x 0.6) + (NQ2 x 0.4)",
    questions: [
      createSelectQuestion(
        "lossCause",
        "NQ1",
        "What was the main cause of the loss?",
        LOSS_CAUSE_OPTIONS,
        "Weather is treated as more insurable risk than poor farming practices."
      ),
      createSelectQuestion(
        "preventableLoss",
        "NQ2",
        "Was the cause preventable?",
        PREVENTABLE_LOSS_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 19,
    domainTitle: "Past Loss Risk",
    areaTitle: "Recovery Ability",
    description: "Recovery strength and income diversification.",
    formula: "Recovery Score = (OQ1 x 0.6) + (OQ2 x 0.4)",
    questions: [
      createSelectQuestion(
        "recoveryAbility",
        "OQ1",
        "How did you recover after the loss?",
        RECOVERY_OPTIONS
      ),
      createSelectQuestion(
        "alternativeIncome",
        "OQ2",
        "Do you have alternative income sources?",
        ALTERNATIVE_INCOME_OPTIONS
      ),
    ],
  },
  {
    stepNumber: 20,
    domainTitle: "Past Loss Risk",
    areaTitle: "Insurance History",
    description: "Insurance participation and whether it helped before.",
    formula: "Insurance Score = (PQ1 x 0.5) + (PQ2 x 0.5)",
    questions: [
      createSelectQuestion(
        "priorInsurance",
        "PQ1",
        "Have you ever insured your farm before?",
        PRIOR_INSURANCE_OPTIONS
      ),
      createSelectQuestion("insuranceHelp", "PQ2", "Did insurance help during losses?", INSURANCE_HELP_OPTIONS),
    ],
  },
];

export const farmerQuestionMap = farmerQuestionSteps
  .flatMap((step) => step.questions)
  .reduce((accumulator, question) => {
    accumulator[question.controlName] = question;
    return accumulator;
  }, {});

export const farmerInitialForm = Object.fromEntries(
  Object.keys(farmerQuestionMap).map((controlName) => [controlName, ""])
);

export const farmerResultPages = [
  {
    key: "overview",
    title: "Financial overview",
    summary: "See the score, risk band, and the capped loan and premium amounts.",
  },
  {
    key: "decision",
    title: "Decision summary",
    summary: "Review the lending recommendation, coverage scope, and protection bundle.",
  },
  {
    key: "breakdown",
    title: "Domain breakdown",
    summary: "Inspect how each domain contributed to the overall farmer risk score.",
  },
];

export const farmerInsurancePackage = ["Credit Life", "Crop Failure", "Weather Index"];
export const farmerLoanCap = 15000;
export const farmerInsuranceCap = 1000;
export const farmerFinalFormula =
  "Risk Score = (Crop Risk x 0.2) + (Farm Size Risk x 0.1) + (Input & Practices Risk x 0.2) + (Weather & Climate Risk x 0.3) + (Past Loss Risk x 0.2)";

const farmerLoanRecommendationTiers = {
  high: "Small loan + additional monitoring required",
  medium: "Moderate loan + extra insurance",
  low: "Maximum loan + standard insurance",
};

export function getFarmerRiskLevel(score) {
  if (score <= 50) {
    return "High Risk";
  }
  if (score <= 80) {
    return "Medium Risk";
  }
  return "Low Risk";
}

export function getFarmerLoanRecommendationTier(score) {
  if (score > 80) {
    return farmerLoanRecommendationTiers.low;
  }
  if (score > 50) {
    return farmerLoanRecommendationTiers.medium;
  }
  return farmerLoanRecommendationTiers.high;
}

export function getFarmerLoanAmount(score) {
  if (score >= 80) {
    return 15000;
  }
  if (score >= 70) {
    return 13500;
  }
  if (score >= 60) {
    return 10500;
  }
  return 7500;
}

export function getFarmerInsurancePremium(score) {
  if (score >= 80) {
    return 500;
  }
  if (score >= 70) {
    return 700;
  }
  if (score >= 60) {
    return 900;
  }
  return 1000;
}

export function calculateFarmerRisk(questionScores) {
  const climate =
    questionScores.irrigationAccess * 0.3 +
    questionScores.rainfallHistory * 0.4 +
    questionScores.droughtFloodHistory * 0.3;
  const cropPest =
    questionScores.pestFrequency * 0.4 +
    questionScores.diseaseControl * 0.4 +
    questionScores.cropExtensionSupport * 0.2;
  const cropInput =
    questionScores.seedType * 0.3 +
    questionScores.fertilizerApplication * 0.3 +
    questionScores.farmManagement * 0.4;
  const market =
    questionScores.guaranteedBuyer * 0.5 +
    questionScores.transportMethod * 0.2 +
    questionScores.priceStability * 0.3;
  const cropRisk = climate * 0.35 + cropPest * 0.25 + cropInput * 0.25 + market * 0.15;

  const size = questionScores.farmSizeAcres;
  const location = questionScores.locationRiskZone * 0.6 + questionScores.nearWaterSource * 0.4;
  const yieldScore =
    questionScores.averageYieldPerAcre * 0.5 +
    questionScores.yieldConsistency * 0.3 +
    questionScores.completeCropFailure * 0.2;
  const farmSizeRisk = size * 0.3 + location * 0.3 + yieldScore * 0.4;

  const fertilizer =
    questionScores.fertilizerUsage * 0.6 + questionScores.fertilizerFrequency * 0.4;
  const irrigation =
    questionScores.irrigationFrequency * 0.6 + questionScores.mainWaterSource * 0.4;
  const practicesPest =
    questionScores.pestControlFrequency * 0.4 +
    questionScores.resistantVarieties * 0.3 +
    questionScores.priorPestImpact * 0.3;
  const extension =
    questionScores.extensionSupport * 0.5 + questionScores.recommendedPractices * 0.5;
  const inputPracticesRisk =
    fertilizer * 0.25 + irrigation * 0.25 + practicesPest * 0.3 + extension * 0.2;

  const drought =
    questionScores.droughtHistory * 0.5 + questionScores.droughtImpact * 0.5;
  const flood =
    questionScores.floodProneArea * 0.5 + questionScores.floodingHistory * 0.5;
  const soil = questionScores.soilQuality * 0.6 + questionScores.soilImprovement * 0.4;
  const gps =
    questionScores.gpsVerification * 0.6 + questionScores.farmingZoneValidation * 0.4;
  const weatherRisk = drought * 0.3 + flood * 0.25 + soil * 0.25 + gps * 0.2;

  const failure =
    questionScores.pastCropFailure * 0.6 + questionScores.affectedSeasons * 0.4;
  const severity =
    questionScores.cropLossPercent * 0.5 + questionScores.repaymentImpact * 0.5;
  const cause = questionScores.lossCause * 0.6 + questionScores.preventableLoss * 0.4;
  const recovery =
    questionScores.recoveryAbility * 0.6 + questionScores.alternativeIncome * 0.4;
  const insurance =
    questionScores.priorInsurance * 0.5 + questionScores.insuranceHelp * 0.5;
  const pastLossRisk =
    failure * 0.3 + severity * 0.25 + cause * 0.2 + recovery * 0.15 + insurance * 0.1;

  const finalScoreRaw =
    cropRisk * 0.2 +
    farmSizeRisk * 0.1 +
    inputPracticesRisk * 0.2 +
    weatherRisk * 0.3 +
    pastLossRisk * 0.2;

  return {
    sectionScoresRaw: {
      cropRisk,
      farmSizeRisk,
      inputPracticesRisk,
      weatherRisk,
      pastLossRisk,
    },
    sectionScoresDisplay: [
      { label: "Crop Risk", value: Math.round(cropRisk) },
      { label: "Farm Size Risk", value: Math.round(farmSizeRisk) },
      { label: "Input & Practices Risk", value: Math.round(inputPracticesRisk) },
      { label: "Weather & Climate Risk", value: Math.round(weatherRisk) },
      { label: "Past Loss Risk", value: Math.round(pastLossRisk) },
    ],
    finalScoreRaw,
    finalScoreDisplay: Math.round(finalScoreRaw),
    riskLevel: getFarmerRiskLevel(finalScoreRaw),
    loanRecommendationTier: getFarmerLoanRecommendationTier(finalScoreRaw),
    loanAmount: getFarmerLoanAmount(finalScoreRaw),
    insurancePremium: getFarmerInsurancePremium(finalScoreRaw),
    insurancePackage: [...farmerInsurancePackage],
  };
}
