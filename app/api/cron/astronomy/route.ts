import { NextResponse } from "next/server";
import { refreshAstronomySnapshotsForLocation } from "@/lib/astronomy";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const locations = await db.location.findMany();

  const results = await Promise.all(
    locations.map((loc) => refreshAstronomySnapshotsForLocation(loc, 7)),
  );

  return NextResponse.json({
    ok: true,
    locations: results,
  });
}
