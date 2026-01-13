// app/api/cron/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { enrichContext } from "@/lib/log/context";
import { addDays } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";

export const runtime = "nodejs";

// Force a date to local midnight
function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);
  await logit({
    ...ctx,
    level: "info",
    message: "astronomy.cron.started",
  });

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logit({
      ...ctx,
      level: "info",
      message: "astronomy.cron.location.started",

      data: { locationId: location.id, name: location.name },
    });

    // Always start from local midnight to avoid “tomorrow’s data”
    const base = atLocalMidnight(new Date());

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);

      await logit({
        ...ctx,
        level: "info",
        message: "astronomy.cron.fetching",
        data: { locationId: location.id, targetDate },
      });

      const snapshot = await buildAstronomySnapshot(location, targetDate);

      await db.astronomySnapshot.upsert({
        where: {
          locationId_date: {
            locationId: location.id,
            date: targetDate,
          },
        },
        update: snapshot,
        create: snapshot,
      });

      await logit({
        ...ctx,
        level: "info",
        message: "astronomy.cron.snapshot.saved",
        data: {
          locationId: location.id,
          date: targetDate.toISOString().slice(0, 10),
        },
      });
    }
  }

  const durationMs = Date.now() - start;

  await logit({
    level: "info",
    message: "astronomy.cron.completed",
    data: { durationMs },
  });

  return NextResponse.json({ ok: true, durationMs });
}
