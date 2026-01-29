// app/api/cron/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";
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

  await logit(
    "ephemeris",
    {
      level: "info",
      message: "astronomy.cron.started",
      payload: { route: "cron" },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logit(
      "ephemeris",
      {
        level: "info",
        message: "astronomy.cron.location.started",
        payload: { locationId: location.id, name: location.name },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );

    // Always start from local midnight to avoid “tomorrow’s data”
    const base = atLocalMidnight(new Date());

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);

      await logit(
        "ephemeris",
        {
          level: "info",
          message: "astronomy.cron.day.started",
          payload: {
            locationId: location.id,
            targetDate: targetDate.toISOString(),
          },
        },
        { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      );

      // Build the full solar/lunar snapshot (now includes solarNoon, illumination, phaseName)
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

      await logit(
        "ephemeris",
        {
          level: "info",
          message: "astronomy.cron.snapshot.saved",
          payload: {
            locationId: location.id,
            date: targetDate.toISOString().slice(0, 10),
            snapshot,
          },
        },
        { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      );
    }
  }

  const durationMs = Date.now() - start;

  await logit(
    "ephemeris",
    {
      level: "info",
      message: "astronomy.cron.completed",
      payload: { durationMs },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  return NextResponse.json({ ok: true, durationMs });
}
