import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createFarmerRiskAssessment,
  getLatestFarmerRiskAssessment,
} from "@/lib/taria/farmer-assessments";
import {
  enforceFarmerRiskSecurity,
  getFarmerRiskCorsHeaders,
} from "@/lib/taria/security";
import {
  farmerRiskAssessmentSchema,
  formatZodError,
} from "@/lib/taria/validation";

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getFarmerRiskCorsHeaders(request),
  });
}

export async function GET(request) {
  const corsHeaders = getFarmerRiskCorsHeaders(request);
  const blocked = enforceFarmerRiskSecurity(request);

  if (blocked) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      blocked.headers.set(key, value);
    });
    return blocked;
  }

  const { searchParams } = new URL(request.url);
  const externalFarmerId = searchParams.get("externalFarmerId")?.trim() || "";
  const farmId = searchParams.get("farmId")?.trim() || "";

  if (!externalFarmerId || !farmId) {
    return NextResponse.json(
      { message: "externalFarmerId and farmId are required." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const assessment = await getLatestFarmerRiskAssessment({ externalFarmerId, farmId });
    return NextResponse.json({ assessment }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Farmer risk assessment GET failed.", {
      code: error?.code,
      message: error?.message,
      name: error?.name,
    });
    return NextResponse.json(
      { message: "Unexpected error", timestamp: new Date().toISOString() },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  const corsHeaders = getFarmerRiskCorsHeaders(request);
  const blocked = enforceFarmerRiskSecurity(request);

  if (blocked) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      blocked.headers.set(key, value);
    });
    return blocked;
  }

  try {
    const payload = await request.json();
    const input = farmerRiskAssessmentSchema.parse(payload);
    const assessment = await createFarmerRiskAssessment(input);

    return NextResponse.json(assessment, { status: 201, headers: corsHeaders });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: formatZodError(error), timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error("Farmer risk assessment POST failed.", {
      code: error?.code,
      message: error?.message,
      name: error?.name,
    });

    return NextResponse.json(
      { message: "Unexpected error", timestamp: new Date().toISOString() },
      { status: 500, headers: corsHeaders }
    );
  }
}
