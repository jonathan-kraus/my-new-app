// app/api/cron/astronomy/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refreshAstronomySnapshotsForLocation } from "@/lib/astronomy";

export const runtime = "nodejs";

export async function GET() {
  // You can scope this to user favorites, or all locations.
  const locations = await db.location.findMany({
    select: {
      id: true,
      latitude: true,
      longitude: true,
      timezone: true,
    },
  });

  const results = [];

  for (const loc of locations) {
    try {
      const days = await refreshAstronomySnapshotsForLocation(
        {
          id: loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone ?? "UTC",
        },
        7,
      );
      results.push({ locationId: loc.id, days: days.length });
    } catch (err) {
      console.error("Astronomy refresh failed", loc.id, err);
      results.push({ locationId: loc.id, error: String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    locations: results,
  });
}
