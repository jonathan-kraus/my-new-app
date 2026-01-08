// app/api/dashboard/astronomy/route.ts
import { NextResponse } from "next/server";
import { getAstronomyForDashboard } from "@/lib/astronomy";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 },
    );
  }

  const { todaySnapshot, tomorrowSnapshot } =
    await getAstronomyForDashboard(locationId);

  return NextResponse.json({
    todaySnapshot,
    tomorrowSnapshot,
  });
}
