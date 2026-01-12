// app/api/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

type AstronomySnapshotRow = {
  id: string;
  locationId: string;
  date: string; // timestamp from Postgres, comes through as ISO-ish string
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  sunriseBlueStart: string;
  sunriseBlueEnd: string;
  sunriseGoldenStart: string;
  sunriseGoldenEnd: string;
  sunsetGoldenStart: string;
  sunsetGoldenEnd: string;
  sunsetBlueStart: string;
  sunsetBlueEnd: string;
  moonPhase: string | null;
};

type AstronomyResponse = {
  today: AstronomySnapshotRow;
  tomorrow: AstronomySnapshotRow | null;
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const email = session?.user?.email ?? null;

    if (!email) {
      await logit({
        level: "warn",
        message: "Astronomy GET unauthorized",
        file: "app/api/astronomy/route.ts",
        page: "Astronomy",
        data: { reason: "No email in session" },
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const dbRls = await getDbWithRls(email);

    // Derive local calendar date in America/New_York
    const now = new Date();
    const localISO = now.toLocaleString("sv-SE", {
      timeZone: "America/New_York",
    });
    const localDate = localISO.slice(0, 10); // "YYYY-MM-DD"

    const searchParams = req.nextUrl.searchParams;
    const locationId = searchParams.get("locationId") ?? "WIL";

    await logit({
      level: "info",
      message: "Astronomy GET resolved local date",
      file: "app/api/astronomy/route.ts",
      page: "Astronomy",
      data: { email, localDate, locationId },
    });

    // Bulletproof: select snapshots using a local-time range,
    // not DATE(date), to avoid UTC/local off-by-one errors.

    // TODAY: [local midnight, local midnight + 1 day)
    const todayRows = (await dbRls.query(
      `
      SELECT *
      FROM "AstronomySnapshot"
      WHERE "date" >= ($1::date AT TIME ZONE 'America/New_York')
        AND "date" < (($1::date + INTERVAL '1 day') AT TIME ZONE 'America/New_York')
        AND "locationId" = $2
      ORDER BY "date" ASC
      LIMIT 1
      `,
      [localDate, locationId],
    )) as AstronomySnapshotRow[];

    const todayRow = todayRows[0] ?? null;

    // TOMORROW: [local date + 1 day, +2 days)
    const tomorrowRows = (await dbRls.query(
      `
      SELECT *
      FROM "AstronomySnapshot"
      WHERE "date" >= (($1::date + INTERVAL '1 day') AT TIME ZONE 'America/New_York')
        AND "date" < (($1::date + INTERVAL '2 days') AT TIME ZONE 'America/New_York')
        AND "locationId" = $2
      ORDER BY "date" ASC
      LIMIT 1
      `,
      [localDate, locationId],
    )) as AstronomySnapshotRow[];

    const tomorrowRow = tomorrowRows[0] ?? null;

    if (!todayRow) {
      await logit({
        level: "warn",
        message: "No astronomy snapshot found for local date",
        file: "app/api/astronomy/route.ts",
        page: "Astronomy",
        data: { email, localDate, locationId },
      });

      return NextResponse.json(
        { error: "No astronomy data for today" },
        { status: 404 },
      );
    }

    const payload: AstronomyResponse = {
      today: todayRow,
      tomorrow: tomorrowRow,
    };

    await logit({
      level: "info",
      message: "Astronomy GET success",
      file: "app/api/astronomy/route.ts",
      page: "Astronomy",
      data: {
        email,
        localDate,
        locationId,
        hasToday: !!todayRow,
        hasTomorrow: !!tomorrowRow,
      },
    });

    return NextResponse.json(payload);
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Astronomy API failed",
      file: "app/api/astronomy/route.ts",
      page: "Astronomy",
      data: { error: err?.message ?? String(err) },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
