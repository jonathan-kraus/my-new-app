import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { addDays, format } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";

export const runtime = "nodejs";

// -----------------------------
// Helpers
// -----------------------------

function normalizeMoonTime(value: string): string {
  return value === "-:-" ? "" : value;
}

function calculateMoonPhase(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;

  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;

  const phase = (r < 0 ? r + 30 : r) / 30;
  return Number(phase.toFixed(4));
}

// -----------------------------
// Cron Route
// -----------------------------

export async function GET() {
  const start = Date.now();

  await logit({
    level: "info",
    message: "astronomy.cron.started",
    file: "app/api/cron/astronomy/route.ts",
    line: 63,
    page: "Astronomy Cron Job",
    data: {},
  });

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logit({
      level: "info",
      message: "astronomy.cron.location.started",
      file: "app/api/cron/astronomy/route.ts",
      line: 75,
      page: "Astronomy Cron Job",
      data: { locationId: location.id, name: location.name },
    });

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(new Date(), i);

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
        level: "info",
        message: "astronomy.cron.snapshot.saved",
        file: "app/api/cron/astronomy/route.ts",
        line: 100,
        page: "Astronomy Cron Job",
        data: {
          locationId: location.id,
          date: targetDate.toISOString().slice(0, 10),
        },
      });
    }
  }

  const ms = Date.now() - start;

  await logit({
    level: "info",
    message: "astronomy.cron.completed",
    file: "app/api/cron/astronomy/route.ts",
    line: 116,
    page: "Astronomy Cron Job",
    data: { durationMs: ms },
  });

  return NextResponse.json({ ok: true, durationMs: ms });
}
