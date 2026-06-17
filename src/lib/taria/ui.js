export const homeModules = [
  {
    key: "insurance",
    tabLabel: "Insurance Risk Profiling",
    tag: "Insurance Advisor",
    title: "Profile personal risk and match people to the right cover faster.",
    summary:
      "Use the TARIA insurance assessment to capture customer needs, assets, travel patterns, and budget, then return ranked recommendations with clear reasons.",
    route: "/insurance/assessment",
    ctaLabel: "Start insurance profiling",
    highlights: [
      "Captures lifestyle, assets, and budget inputs",
      "Generates recommendation ranking with reasons",
      "Keeps the current insurance purchase journey intact",
    ],
    outputTitle: "Insurance outputs",
    outputItems: [
      "Assessment ID and recommendation results",
      "Recommended approved products",
      "Clear reasons tied to customer responses",
    ],
  },
  {
    key: "farmer",
    tabLabel: "Farmer Risk Profiling",
    tag: "Agricultural Credit Protection",
    title: "Profile farmer risk and support agricultural loan and protection decisions.",
    summary:
      "Use the farmer workflow to capture crop, farm operations, market access, and resilience indicators, then calculate a farmer risk score for downstream credit and insurance decisions.",
    route: "/farmer-risk/assessment",
    ctaLabel: "Start farmer profiling",
    highlights: [
      "Captures farm size, GPS, production, and loss factors",
      "Calculates a farmer risk score and risk level",
      "Shows premium, loan, and monitoring guidance",
    ],
    outputTitle: "Farmer outputs",
    outputItems: [
      "Farmer risk score and risk level",
      "Premium band and loan decision guidance",
      "Recommended protection bundle and next actions",
    ],
  },
];

export const quickSections = [
  {
    title: "Safety",
    color: "#2f6bff",
    summary:
      "Safety is the foundation of TARIA. We protect users, partners, and institutions with secure architecture, encrypted data handling, and compliant advisory workflows.",
    route: "/support/safety",
  },
  {
    title: "Help Center",
    color: "#14b86a",
    summary:
      "Guides, FAQs, and clear explanations on assessments, recommendations, policy selection, and claims support.",
    route: "/support/help-center",
  },
  {
    title: "Contact Us",
    color: "#d86618",
    summary:
      "Reach out for demos, integrations, or customer support. We’re ready to help you move faster with TARIA.",
    route: "/support/contact",
  },
  {
    title: "About Us",
    color: "#0c1f6b",
    summary:
      "TARIA is the TripSecure AI Risk & Insurance Advisory platform. We connect institutions and customers to approved products with explainable, compliant intelligence.",
    route: "/support/about",
  },
];

export const assessmentOptions = {
  employmentOptions: [
    { value: "FULL_TIME_EMPLOYED", label: "Full-time employed" },
    { value: "SELF_EMPLOYED", label: "Self-employed" },
    { value: "CONTRACT_GIG", label: "Contract / Gig work" },
    { value: "STUDENT", label: "Student" },
    { value: "UNEMPLOYED_RETIRED", label: "Unemployed / Retired" },
  ],
  dependentOptions: [
    { value: "NONE", label: "None" },
    { value: "ONE_TO_TWO", label: "1-2" },
    { value: "THREE_TO_FOUR", label: "3-4" },
    { value: "FIVE_OR_MORE", label: "5+" },
  ],
  assetOptions: [
    { value: "SMARTPHONE", label: "Smartphone" },
    { value: "LAPTOP_TABLET", label: "Laptop / Tablet" },
    { value: "MOTORBIKE", label: "Motorbike" },
    { value: "CAR", label: "Car" },
    { value: "HOME_RENTED_APARTMENT", label: "Home / Rented Apartment" },
    { value: "NONE_OF_THE_ABOVE", label: "None of the above" },
  ],
  travelOptions: [
    { value: "NO_TRAVEL", label: "No travel" },
    { value: "DOMESTIC_TRAVEL", label: "Domestic travel" },
    { value: "INTERNATIONAL_TRAVEL", label: "International travel" },
  ],
  lateNightOptions: [
    { value: "RARELY", label: "Rarely" },
    { value: "SOMETIMES", label: "Sometimes" },
    { value: "OFTEN", label: "Often" },
    { value: "ALMOST_DAILY", label: "Almost daily" },
  ],
  mobilityOptions: [
    { value: "WALK_BICYCLE", label: "Walk / Bicycle" },
    { value: "PUBLIC_TRANSPORT", label: "Public transport" },
    { value: "RIDE_HAILING", label: "Ride hailing" },
    { value: "PERSONAL_CAR_MOTORBIKE", label: "Personal car / motorbike" },
    { value: "MIXED", label: "Mixed" },
  ],
  riskyActivityOptions: [
    { value: "NEVER", label: "Never" },
    { value: "OCCASIONALLY", label: "Occasionally" },
    { value: "FREQUENTLY", label: "Frequently" },
    { value: "AS_PART_OF_JOB", label: "As part of my job" },
  ],
  careOptions: [
    { value: "VERY_CAREFUL", label: "Very careful" },
    { value: "MOSTLY_CAREFUL", label: "Mostly careful" },
    { value: "SOMETIMES_CARELESS", label: "Sometimes careless" },
    { value: "OFTEN_LOSE_DAMAGE", label: "Often lose/damage" },
  ],
  expenseOptions: [
    { value: "VERY_PREDICTABLE", label: "Very predictable" },
    { value: "MOSTLY_PREDICTABLE", label: "Mostly predictable" },
    { value: "SOMETIMES_UNPREDICTABLE", label: "Sometimes unpredictable" },
    { value: "HIGHLY_UNPREDICTABLE", label: "Highly unpredictable" },
  ],
  emergencyOptions: [
    { value: "EASILY_PAY_FROM_SAVINGS", label: "Pay from savings" },
    { value: "MANAGE_WITH_DIFFICULTY", label: "Manage with difficulty" },
    { value: "NEED_TO_BORROW", label: "Need to borrow" },
    { value: "UNABLE_TO_COPE", label: "Unable to cope" },
  ],
  paymentOptions: [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ],
  budgetOptions: [
    { value: "LESS_THAN_2", label: "Below 2%" },
    { value: "TWO_TO_FIVE", label: "2-5%" },
    { value: "SIX_TO_TEN", label: "6-10%" },
    { value: "MORE_THAN_TEN", label: "10%+" },
  ],
  experienceOptions: [
    { value: "NONE", label: "No insurance experience" },
    { value: "HAD_POLICY_NEVER_CLAIMED", label: "Had a policy, never claimed" },
    { value: "HAD_POLICY_CLAIMED", label: "Had a policy and claimed" },
  ],
  concernOptions: [
    { value: "COST", label: "Cost" },
    { value: "CLAIMS_NOT_PAID", label: "Claims not paid" },
    { value: "COMPLEXITY_FINE_PRINT", label: "Complex terms" },
    { value: "NOT_SEEING_VALUE", label: "Not seeing value" },
    { value: "NO_CONCERNS", label: "No concerns" },
  ],
  priorityOptions: [
    { value: "LOWEST_PRICE", label: "Lowest price" },
    { value: "FLEXIBLE_PAYMENTS", label: "Flexible payments" },
    { value: "FAST_CLAIMS", label: "Fast claims" },
    { value: "WIDE_COVERAGE", label: "Wide coverage" },
    { value: "TRUSTED_BRAND", label: "Trusted brand" },
  ],
};
