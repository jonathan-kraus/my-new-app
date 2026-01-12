// app/api/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

// -----------------------------
// Sunrise correction helper
// -----------------------------
function pickCorrectSunrise(snapshot: {
  sunrise: string;
  todaySunrise?: string | null;
}) {
  const now = new Date();

  const sunrise = new Date(snapshot.sunrise);
  const todaySunrise = snapshot.todaySunrise
    ? new Date(snapshot.todaySunrise)
    : null;

  const localDate = now.toISOString().slice(0, 10);
  const sunriseDate = sunrise.toISOString().slice(0, 10);

  // If snapshot is for tomorrow but today's sunrise hasn't happened yet,
  // use today's sunrise instead.
  if (sunriseDate > localDate && todaySunrise && todaySunrise > now) {
    return todaySunrise;
  }

  return sunrise;
}

// -----------------------------
// Types
// -----------------------------
type AstronomySnapshotRow = {
  id: string;
  locationId: string;
  date: string;
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

// -----------------------------
// GET handler
// -----------------------------
export async function GET(req: NextRequest) {
  try {
    // -----------------------------
    // Auth
    // -----------------------------
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

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbRls = await getDbWithRls(email);

    // -----------------------------
    // Local date (America/New_York)
    // -----------------------------
    const now = new Date();
    const localISO = now.toLocaleString("sv-SE", {
      timeZone: "America/New_York",
    });
    const localDate = localISO.slice(0, 10);

    const locationId = req.nextUrl.searchParams.get("locationId") ?? "WIL";

    await logit({
      level: "info",
      message: "Astronomy GET resolved local date",
      file: "app/api/astronomy/route.ts",
      page: "Astronomy",
      data: { email, localDate, locationId },
    });

    // -----------------------------
    // Fetch TODAY snapshot
    // -----------------------------
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
      [localDate, locationId]
    )) as AstronomySnapshotRow[];

    const todayRow = todayRows[0] ?? null;

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
        { status: 404 }
      );
    }

    // -----------------------------
    // Fetch TOMORROW snapshot
    // -----------------------------
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
      [localDate, locationId]
    )) as AstronomySnapshotRow[];

    const tomorrowRow = tomorrowRows[0] ?? null;

    // -----------------------------
    // Apply sunrise correction
    // -----------------------------
    const correctedTodaySunrise = pickCorrectSunrise({
      sunrise: todayRow.sunrise,
      todaySunrise: todayRow.sunrise,
    });

    const correctedTomorrowSunrise = tomorrowRow
      ? pickCorrectSunrise({
          sunrise: tomorrowRow.sunrise,
          todaySunrise: todayRow.sunrise,
        })
      : null;

    // -----------------------------
    // Build payload
    // -----------------------------
    const payload = {
      today: {
        ...todayRow,
        correctedSunrise: correctedTodaySunrise.toISOString(),
      },
      tomorrow: tomorrowRow
        ? {
            ...tomorrowRow,
            correctedSunrise:
              correctedTomorrowSunrise?.toISOString() ?? null,
          }
        : null,
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
      { status: 500 }
    );
  }
}
