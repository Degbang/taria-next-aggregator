import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createFarmerRiskAssessment,
  getLatestFarmerRiskAssessment,
} from "@/lib/taria/farmer-assessments";
import {
  enforceFarmerRiskSecurity,
  getFarmerRiskCorsHeaders,
  verifyFarmerRiskHandoffToken,
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
  const blocked = await enforceFarmerRiskSecurity(request);

  if (blocked) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      blocked.headers.set(key, value);
    });
    return blocked;
  }

  const { searchParams } = new URL(request.url);
  const externalFarmerId = searchParams.get("externalFarmerId")?.trim() || "";
  const farmId = searchParams.get("farmId")?.trim() || "";
  const handoff =
    request.headers.get("x-taria-handoff")?.trim() || searchParams.get("handoff")?.trim() || "";

  if (!externalFarmerId || !farmId) {
    return NextResponse.json(
      { message: "externalFarmerId and farmId are required." },
      { status: 400, headers: corsHeaders }
    );
  }

  const handoffPayload = await verifyFarmerRiskHandoffToken(handoff);
  if (!handoffPayload || handoffPayload.farmerId !== externalFarmerId || handoffPayload.farmId !== farmId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
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
  try {
    const payload = await request.json();
    const input = farmerRiskAssessmentSchema.parse(payload);
    const requiresHandoff = Boolean(input.externalFarmerId || input.farmId || input.sourceApplication);
    const blocked = await enforceFarmerRiskSecurity(request, { required: requiresHandoff });
    if (blocked) {
      Object.entries(corsHeaders).forEach(([key, value]) => blocked.headers.set(key, value));
      return blocked;
    }
    if (requiresHandoff) {
      const handoff = request.headers.get("x-taria-handoff")?.trim() || "";
      const handoffPayload = await verifyFarmerRiskHandoffToken(handoff);
      if (
        !handoffPayload ||
        handoffPayload.farmerId !== input.externalFarmerId ||
        handoffPayload.farmId !== input.farmId
      ) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
      }
    }
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
