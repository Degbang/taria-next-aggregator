import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createFarmerRiskAssessment } from "@/lib/taria/farmer-assessments";
import {
  farmerRiskAssessmentSchema,
  formatZodError,
} from "@/lib/taria/validation";

export async function POST(request) {
  try {
    const payload = await request.json();
    const input = farmerRiskAssessmentSchema.parse(payload);
    const assessment = await createFarmerRiskAssessment(input);

    return NextResponse.json(assessment, { status: 201 });
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
