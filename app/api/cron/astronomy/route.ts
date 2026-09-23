// app/api/cron/astronomy/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import { createId } from "@paralleldrive/cuid2";
import { staticUniversalContext } from "@/lib/log/buildj";
import { timestampString } from "@/lib/timestampString";
import { addDays, format } from "date-fns";
import { buildAstronomySnapshot } from "@/lib/buildAstronomySnapshot";
import { getConfig } from "@/lib/runtime/config";
import { Temporal } from "temporal-polyfill";
import { DateTime } from "luxon";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const varchar10 = (value: string) =>
  value as string & { readonly __varcharLength: 10 };

// Force a date to local midnight
function atLocalMidnight(d: Date, timeZone: string) {
  const local = DateTime.fromJSDate(d, { zone: timeZone });
  return new Date(local.year, local.month - 1, local.day);
}
async function cleanupOldLogs(
  days: number,
  built: Awaited<ReturnType<typeof staticUniversalContext>>,
) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let jei = 0;
  // Count before

  const { total: beforeCount } = await db8.orm.public.Log.aggregate((agg) => ({
    total: agg.count(),
  }));

  const deleteCount = await db8.orm.public.Log.where((log) =>
    log.createdAt.lt(timestampString(cutoff.toISOString())),
  ).deleteAndCount();

  const { total: afterCount } = await db8.orm.public.Log.aggregate((agg) => ({
    total: agg.count(),
  }));

  // Log the cleanup
  await logj({
    domain: "logs",
    level: "info",
    message: `Log cleanup completed`,
    file: "app/api/cron/astronomy/route.ts",
    line: 43,
    payload: {
      beforeCount,
      deleted: deleteCount,
      afterCount,
      cutoff: cutoff.toISOString(),
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return deleteCount;
}

export async function GET(_req: NextRequest) {
  const start = Date.now();
  const built = staticUniversalContext("ASTRONOMY");
  let jei = 1;
  const locations = await db8.orm.public.Location.all();

  let daysProcessed = 0;

  for (const location of locations) {
    await logj({
      domain: "ephemeris",
      level: "info",
      message: `Astronomy cron location started for ${location.name}`,
      file: "app/api/cron/astronomy/route.ts",
      line: 70,
      payload: {
        name: location.name,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const base = atLocalMidnight(new Date(), location.timezone);

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);
      const dateString = varchar10(format(targetDate, "yyyy-MM-dd"));

      await logj({
        domain: "ephemeris",
        level: "info",
        message: `Astronomy cron day started for ${location.name} count: ${i + 1}`,
        file: "app/api/cron/astronomy/route.ts",
        line: 88,
        payload: {
          count: i,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

      const snapshot = await buildAstronomySnapshot(location, targetDate);

      const row = {
        ...snapshot,
        fetchedAt: Temporal.Instant.from(snapshot.fetchedAt.toISOString())
          .toZonedDateTimeISO("UTC")
          .toPlainDateTime(),
        locationId: location.id,
        dateString,
      };

      const existing = await db8.orm.public.AstronomySnapshot.where(
        (snapshot) => snapshot.locationId.eq(location.id),
      )
        .where((snapshot) => snapshot.dateString.eq(dateString))
        .first();

      if (existing) {
        await db8.orm.public.AstronomySnapshot.where({
          id: existing.id,
        }).update(row);
      } else {
        await db8.orm.public.AstronomySnapshot.create({
          ...row,
          id: createId(),
        });
      }

      await logj({
        domain: "ephemeris",
        level: "info",
        message: `Astronomy cron location upsert for ${location.name} completed`,
        file: "app/api/cron/astronomy/route.ts",
        line: 125,
        payload: {
          duration: Date.now() - start,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });
      daysProcessed++;
      revalidateTag("astronomy-snapshot", { expire: 0 });
    }
  }

  const logDays = await getConfig("logDays", "61");
  const logDaysNum = logDays?.toString() ?? "61";
  const cleanupDays = Number.isNaN(logDaysNum) ? 61 : parseInt(logDaysNum, 10);
  const deleted = await cleanupOldLogs(cleanupDays, built);

  await logj({
    domain: "ephemeris",
    level: "info",
    message: `Astronomy cron completed deleted ${deleted} logs`,
    file: "app/api/cron/astronomy/route.ts",
    line: 143,
    payload: {
      durationMs: Date.now() - start,
      logDays: logDays,
      logDaysNum: logDaysNum,
      cleanupDays: cleanupDays,
      logsDeleted: deleted,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - start,
    daysProcessed,
  });
}
