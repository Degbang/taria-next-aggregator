import { NextResponse } from "next/server";
import { tariaConfig } from "./config";

const rateLimitStore = globalThis.__tariaRateLimitStore || new Map();

if (!globalThis.__tariaRateLimitStore) {
  globalThis.__tariaRateLimitStore = rateLimitStore;
}

export function enforceRecommendationSecurity(request) {
  const apiKey = request.headers.get("x-taria-key")?.trim() || "";

  if (tariaConfig.recommendationAuthEnabled) {
    if (tariaConfig.recommendationApiKeys.length === 0) {
      return NextResponse.json(
        { message: "Recommendation auth is misconfigured", timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }

    if (!tariaConfig.recommendationApiKeys.includes(apiKey)) {
      return NextResponse.json(
        { message: "Unauthorized", timestamp: new Date().toISOString() },
        {
          status: 401,
          headers: { "WWW-Authenticate": 'ApiKey realm="recommendations"' },
        }
      );
    }
  }

  if (tariaConfig.recommendationRateLimitEnabled) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
    const key = `${apiKey || "anonymous"}:${ip}`;
    const now = Date.now();
    const windowMs = Math.max(tariaConfig.recommendationRateLimitWindowSeconds, 1) * 1000;
    const bucket = rateLimitStore.get(key) || [];
    const active = bucket.filter((stamp) => now - stamp < windowMs);

    if (active.length >= Math.max(tariaConfig.recommendationRateLimitRequests, 1)) {
      return NextResponse.json(
        { message: "Rate limit exceeded", timestamp: new Date().toISOString() },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(tariaConfig.recommendationRateLimitWindowSeconds, 1)),
            "X-RateLimit-Limit": String(Math.max(tariaConfig.recommendationRateLimitRequests, 1)),
          },
        }
      );
    }

    active.push(now);
    rateLimitStore.set(key, active);
  }

  return null;
}
