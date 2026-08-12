// app/api/cron/astronomy/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { addDays, format } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";
import { getConfig, setConfig } from "@/lib/runtime/config";

export const runtime = "nodejs";

// Force a date to local midnight
function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
async function cleanupOldLogs(days: number, built: any) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let jei = 0;
  // Count before
  const beforeCount = await db.log.count();

  // Delete
  const result = await db.log.deleteMany({
    where: {
      created_at: {
        lt: cutoff,
      },
    },
  });

  // Count after
  const afterCount = await db.log.count();

  // Log the cleanup
  await logj({
    domain: "logs",
    level: "info",
    message: `Log cleanup completed`,
    file: "app/api/cron/astronomy/route.ts",
    line: 36,
    payload: {
      beforeCount,
      deleted: result.count,
      afterCount,
      cutoff: cutoff.toISOString(),
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return result.count;
}
async function cleanupEphem(days: number, built: any) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let jei = 1;
  // Count before
  const beforeCount = await db.ephemerisDebug.count();

  // Delete
  const result = await db.ephemerisDebug.deleteMany({
    where: {
      receivedAt: {
        lt: cutoff,
      },
    },
  });

  // Count after
  const afterCount = await db.ephemerisDebug.count();

  // Log the cleanup
  await logj({
    domain: "ephemeris",
    level: "info",
    message: `Ephemeris cleanup completed`,
    file: "app/api/cron/astronomy/route.ts",
    line: 72,
    payload: {
      beforeCount,
      deleted: result.count,
      afterCount,
      cutoff: cutoff.toISOString(),
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return result.count;
}
export async function GET(req: NextRequest) {
  const start = Date.now();
  const built = staticUniversalContext("ASTRONOMY");
  let jei = 1;
  const locations = await db.location.findMany();
  const durationMs = Date.now() - start;
  for (const location of locations) {
    await logj({
      domain: "ephemeris",
      level: "info",
      message: `Astronomy cron location started for ${location.name}`,
      file: "app/api/cron/astronomy/route.ts",
      line: 96,
      payload: {
        name: location.name,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    const base = atLocalMidnight(new Date());

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);
      const dateString = format(targetDate, "yyyy-MM-dd");

      await logj({
        domain: "ephemeris",
        level: "info",
        message: `Astronomy cron day started for ${location.name} count: ${i + 1} `,
        file: "app/api/cron/astronomy/route.ts",
        line: 113,
        payload: {
          count: i,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

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

    await logj({
      domain: "ephemeris",
      level: "info",
      message: `Astronomy cron location upsert for ${location.name} completed`,
      file: "app/api/cron/astronomy/route.ts",
      line: 147,
      payload: {
        duration: durationMs,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    const logDays = await getConfig("logDays", "61");
    const logDaysNum = logDays?.toString() ?? "61";
    const cleanupDays = Number.isNaN(logDaysNum)
      ? 61
      : parseInt(logDaysNum, 10);
    const deleted = await cleanupOldLogs(cleanupDays, built);

    await logj({
      domain: "ephemeris",
      level: "info",
      message: `Astronomy cron completed deleted ${deleted} logs`,
      file: "app/api/cron/astronomy/route.ts",
      line: 165,
      payload: {
        durationMs,
        logDays: logDays,
        logDaysNum: logDaysNum,
        cleanupDays: cleanupDays,
        logsDeleted: deleted,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json({ ok: true, durationMs });
  }
}
