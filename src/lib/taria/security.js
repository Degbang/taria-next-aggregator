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

const base64UrlToBytes = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export async function verifyFarmerRiskHandoffToken(token) {
  const [encodedPayload, encodedSignature] = String(token || "").split(".");
  if (!encodedPayload || !encodedSignature || !tariaConfig.farmerRiskHandoffSecret) {
    return null;
  }

  try {
    const payloadBytes = base64UrlToBytes(encodedPayload);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (
      !payload ||
      typeof payload.farmerId !== "string" ||
      typeof payload.farmId !== "string" ||
      !Number.isFinite(Number(payload.expiresAt)) ||
      Number(payload.expiresAt) < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(tariaConfig.farmerRiskHandoffSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(encodedPayload),
    );
    return valid ? payload : null;
  } catch {
    return null;
  }
}

export async function enforceFarmerRiskSecurity(request, { required = true } = {}) {
  if (!required) return null;

  const handoff = request.headers.get("x-taria-handoff")?.trim() ||
    new URL(request.url).searchParams.get("handoff")?.trim() || "";
  if (!handoff || !tariaConfig.farmerRiskHandoffSecret) {
    return NextResponse.json(
      { message: "Authenticated TARIA handoff required", timestamp: new Date().toISOString() },
      { status: 401, headers: { "WWW-Authenticate": 'Handoff realm="farmer-risk"' } }
    );
  }

  const payload = await verifyFarmerRiskHandoffToken(handoff);
  if (!payload) {
    return NextResponse.json(
      { message: "Unauthorized", timestamp: new Date().toISOString() },
      { status: 401 }
    );
  }

  return null;
}

export function enforceRecordsSecurity(request) {
  const apiKey = request.headers.get("x-taria-key")?.trim() || "";

  if (!tariaConfig.recordsAuthEnabled) {
    return null;
  }

  if (tariaConfig.recordsApiKeys.length === 0) {
    return NextResponse.json(
      { message: "Records auth is misconfigured", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  if (!tariaConfig.recordsApiKeys.includes(apiKey)) {
    return NextResponse.json(
      { message: "Unauthorized", timestamp: new Date().toISOString() },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'ApiKey realm="records"' },
      }
    );
  }

  return null;
}

export function getFarmerRiskCorsHeaders(request) {
  const origin = request.headers.get("origin")?.trim();

  if (!origin) {
    return {};
  }

  const allowedOrigins = tariaConfig.farmerRiskAllowedOrigins;

  if (allowedOrigins.length === 0) {
    return {};
  }

  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes("*") ? "*" : origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-taria-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
