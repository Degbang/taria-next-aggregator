export const tariaConfig = {
  productSource: process.env.TARIA_PRODUCT_SOURCE || "local",
  tripsecureBaseUrl: process.env.TRIPSECURE_BASE_URL || "https://api.tripsecuregh.com",
  tripsecurePolicyPath: process.env.TRIPSECURE_POLICY_PATH || "/api/policy/get",
  tripsecureApiKey: process.env.TRIPSECURE_API_KEY || "",
  tripsecureApiKeyHeader: process.env.TRIPSECURE_API_KEY_HEADER || "x-api-key",
  aiBaseUrl: process.env.AI_BASE_URL || "https://api.openai.com",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "gpt-4o-mini",
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 7000),
  aiTemperature: Number(process.env.AI_TEMPERATURE || 0),
  recommendationAuthEnabled:
    process.env.NODE_ENV === "production" || process.env.RECOMMENDATION_AUTH_ENABLED === "true",
  recommendationApiKeys: (process.env.RECOMMENDATION_API_KEYS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  farmerRiskAuthEnabled: process.env.FARMER_RISK_AUTH_ENABLED === "true",
  farmerRiskApiKeys: (process.env.FARMER_RISK_API_KEYS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  farmerRiskAllowedOrigins: (process.env.FARMER_RISK_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  farmerRiskHandoffSecret:
    process.env.FARMER_RISK_HANDOFF_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "local-development-handoff"),
  recordsAuthEnabled: process.env.RECORDS_AUTH_ENABLED !== "false",
  recordsApiKeys: (process.env.RECORDS_API_KEYS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  recommendationRateLimitEnabled:
    process.env.NODE_ENV === "production" || process.env.RECOMMENDATION_RATE_LIMIT_ENABLED !== "false",
  recommendationRateLimitRequests: Number(process.env.RECOMMENDATION_RATE_LIMIT_REQUESTS || 60),
  recommendationRateLimitWindowSeconds: Number(process.env.RECOMMENDATION_RATE_LIMIT_WINDOW_SECONDS || 60),
  assessmentSessionSecret:
    process.env.INSURANCE_ASSESSMENT_SESSION_SECRET ||
    process.env.FARMER_RISK_HANDOFF_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "local-development-assessment-session"),
  assessmentSessionTtlSeconds: Number(process.env.INSURANCE_ASSESSMENT_SESSION_TTL_SECONDS || 3600),
  assessmentCreateRateLimitRequests: Number(process.env.ASSESSMENT_CREATE_RATE_LIMIT_REQUESTS || 10),
  assessmentCreateRateLimitWindowSeconds: Number(process.env.ASSESSMENT_CREATE_RATE_LIMIT_WINDOW_SECONDS || 600),
  farmerRiskRateLimitRequests: Number(process.env.FARMER_RISK_RATE_LIMIT_REQUESTS || 30),
  farmerRiskRateLimitWindowSeconds: Number(process.env.FARMER_RISK_RATE_LIMIT_WINDOW_SECONDS || 600),
};
