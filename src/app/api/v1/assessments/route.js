import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createAssessment } from "@/lib/taria/recommendations";
import { assessmentSchema, formatZodError } from "@/lib/taria/validation";

export async function POST(request) {
  try {
    const payload = await request.json();
    const input = assessmentSchema.parse(payload);
    const assessment = await createAssessment(input);

    return NextResponse.json(
      {
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt,
      },
      { status: 201 }
    );
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
