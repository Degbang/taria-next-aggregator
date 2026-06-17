import { NextResponse } from "next/server";
import { getOrCreateRecommendations } from "@/lib/taria/recommendations";
import { enforceRecommendationSecurity } from "@/lib/taria/security";

async function handle(request, context) {
  const blocked = enforceRecommendationSecurity(request);
  if (blocked) {
    return blocked;
  }

  const { assessmentId } = await context.params;
  const result = await getOrCreateRecommendations(assessmentId);

  if (!result) {
    return NextResponse.json(
      { message: `Assessment not found: ${assessmentId}`, timestamp: new Date().toISOString() },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}

export async function GET(request, context) {
  return handle(request, context);
}

export async function POST(request, context) {
  return handle(request, context);
}
