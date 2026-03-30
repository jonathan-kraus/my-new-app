// app/api/cron/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { addDays, format } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";


export const runtime = "nodejs";

// Force a date to local midnight
function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const built = await buildUniversalContext(req, "ASTRONOMY");

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logj({
    domain: "ephemeris",
    level: "info",
    message: `astronomy.cron.location.started for ${location.name}`,
    file: "app/api/cron/astronomy/route.ts",
    line: 24,
    payload: {
      name: location.name,
    },
    meta: {
      built,
    },
  });
    const base = atLocalMidnight(new Date());

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);
      const dateString = format(targetDate, "yyyy-MM-dd");

      // await log.api("ephemeris", "astronomy.cron.day.started", {
      //   locationId: location.id,
      //   dateString: dateString,
      //   targetDate: targetDate.toISOString(),
      //   count: i,
      // });

      // Build the full solar/lunar snapshot
      const snapshot = await buildAstronomySnapshot(location, targetDate);

      // Inject dateString into the snapshot before writing
      const row = {
        ...snapshot,
        locationId: location.id,
        dateString,
      };

      await db.astronomySnapshot.upsert({
        where: {
          locationId_dateString: {
            locationId: location.id,
            dateString,
          },
        },
        update: row,
        create: row,
      });
    }

    // await log.api("ephemeris", "astronomy.cron.location.upsert.completed");

    const durationMs = Date.now() - start;
    // await log.api("ephemeris", "astronomy.cron.completed");

    return NextResponse.json({ ok: true, durationMs });
  }
}
