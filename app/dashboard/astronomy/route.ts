// app/api/dashboard/astronomy/route.ts
import { NextResponse } from "next/server";
import { getAstronomyForDashboard } from "@/lib/astronomy";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") ?? "KOP";

  // Fetch all snapshots for this location
  const snapshots = await getAstronomyForDashboard(locationId);

  if (!snapshots || snapshots.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "No astronomy snapshots found",
      locationId,
    });
  }

  // Determine today/tomorrow based on actual dates
  const today = new Date();
  const todayDateStr = today.toISOString().slice(0, 10);

  const todaySnapshot =
    snapshots.find((s) => s.date.toISOString().slice(0, 10) === todayDateStr) ??
    null;

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().slice(0, 10);

  const tomorrowSnapshot =
    snapshots.find(
      (s) => s.date.toISOString().slice(0, 10) === tomorrowDateStr,
    ) ?? null;

  return NextResponse.json({
    ok: true,
    locationId,
    todaySnapshot,
    tomorrowSnapshot,
    allSnapshots: snapshots,
  });
}
