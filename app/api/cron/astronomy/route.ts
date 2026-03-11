// app/api/cron/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";
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

  await logit("ephemeris", {
        level: "info",
        message: "astronomy.cron.started DB-tables first",
        route: "cron",
        rebuild: true,
      }, { eventIndex }, {
          requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  await runDbTableStats({
    requestId: ctx.requestId,
    route: ctx.page,
    userId: ctx.userId,
  });

  await logit("DbTable", {
        level: "info",
        message: "astronomy.cron.dbtables.completed",
        Db: "Db",
        Table: "Table",
      }, { eventIndex }, {
          requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logit("ephemeris", {
            level: "info",
            message: "astronomy.cron.location.started",
            locationId: location.id,
            name: location.name,
          }, { eventIndex }, {
            requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
            requestId: ctx?.requestId ?? req?.id,
            zulu: new Date().toISOString(),
            local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
          });

    const base = atLocalMidnight(new Date());

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(base, i);
      const dateString = format(targetDate, "yyyy-MM-dd");

      await logit("ephemeris", {
                level: "info",
                message: "astronomy.cron.day.started",
                locationId: location.id,
                targetDate: dateString,
              }, { eventIndex }, {
              requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
              requestId: ctx?.requestId ?? req?.id,
              zulu: new Date().toISOString(),
              local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
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

      await logit("ephemeris", {
                level: "info",
                message: "astronomy.cron.snapshot.saved",
                locationId: location.id,
                dateString,
                snapshot: row,
              }, { eventIndex }, {
              requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
              requestId: ctx?.requestId ?? req?.id,
              zulu: new Date().toISOString(),
              local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
            });
    }
  }

  const durationMs = Date.now() - start;

  await logit("ephemeris", {
        level: "info",
        message: "astronomy.cron.completed",
        durationMs,
      }, { eventIndex }, {
          requestId: ctx.requestId, route: ctx.page, userId: ctx.userId,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  return NextResponse.json({ ok: true, durationMs });
}
