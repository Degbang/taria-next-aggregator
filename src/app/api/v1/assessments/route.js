import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createAssessment } from "@/lib/taria/recommendations";
import { assessmentSchema, formatZodError } from "@/lib/taria/validation";
import {
  createAssessmentSessionToken,
  enforceRateLimit,
} from "@/lib/taria/security";
import { tariaConfig } from "@/lib/taria/config";

export async function POST(request) {
  try {
    if (!tariaConfig.assessmentSessionSecret) {
      return NextResponse.json(
        { message: "Assessment session is misconfigured.", timestamp: new Date().toISOString() },
        { status: 503 },
      );
    }

    const rateLimited = enforceRateLimit(request, {
      action: "insurance-assessment-create",
      maxRequests: tariaConfig.assessmentCreateRateLimitRequests,
      windowSeconds: tariaConfig.assessmentCreateRateLimitWindowSeconds,
    });
    if (rateLimited) return rateLimited;

    const payload = await request.json();
    const input = assessmentSchema.parse(payload);
    const assessment = await createAssessment(input);
    const sessionToken = await createAssessmentSessionToken(assessment.id);

    const response = NextResponse.json(
      {
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt,
      },
      { status: 201 }
    );
    response.cookies.set({
      name: "taria_assessment_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.max(tariaConfig.assessmentSessionTtlSeconds, 1),
    });
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: formatZodError(error), timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Unexpected error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
