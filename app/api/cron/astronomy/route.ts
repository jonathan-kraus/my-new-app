// app/api/cron/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { enrichContext } from "@/lib/log/context";
import { addDays, format } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";
import { runDbTableStats } from "@/lib/cron/runDbTableStats";

export const runtime = "nodejs";

// Force a date to local midnight
function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);
  // await log.api("ephemeris", "astronomy.cron.started DB-tables first");

  await runDbTableStats({
    requestId: ctx.requestId,
    route: ctx.route,
    userId: ctx.userId,
  });

  // await log.api("ephemeris", "astronomy.cron.dbtables.completed");

  const locations = await db.location.findMany();

  for (const location of locations) {
    // await log.api("ephemeris", "astronomy.cron.location.started");

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
