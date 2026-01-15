// app/api/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { enrichContext } from "@/lib/log/context";
// ------------------------------------------------------------
// Sunrise correction helper
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// GET handler
// ------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    // -----------------------------
    // Auth
    // -----------------------------
    const session = await auth.api.getSession({ headers: req.headers });
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // -----------------------------
    // Local date (America/New_York)
    // -----------------------------
    const now = new Date();
    const localISO = now.toLocaleString("sv-SE", {
      timeZone: "America/New_York",
    });
    const localDate = localISO.slice(0, 10); // "YYYY-MM-DD"
    const tomorrowDate = new Date(
      new Date(localDate).getTime() + 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10);

    const locationId = req.nextUrl.searchParams.get("locationId") ?? "WIL";

    // -----------------------------
    // Fetch ALL snapshots for location
    // -----------------------------
    type AstronomyRow = {
      date: Date;
      [key: string]: any;
    };

    const rows = await db.astronomySnapshot.findMany({
      where: { locationId },
      orderBy: { date: "asc" },
    });

    // -----------------------------
    // Select TODAY and TOMORROW by calendar date
    // -----------------------------
    const todayRow = rows.find(
      (r) => r.date.toISOString().slice(0, 10) === localDate,
    );

    const tomorrowRow = rows.find(
      (r) => r.date.toISOString().slice(0, 10) === tomorrowDate,
    );

    if (!todayRow) {
      return NextResponse.json(
        { error: "No astronomy data for today" },
        { status: 404 },
      );
    }

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
            correctedSunrise: correctedTomorrowSunrise?.toISOString() ?? null,
          }
        : null,
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    const ctx = await enrichContext(req);
    await logit({
      ...ctx,
      level: "error",
      message: "Astronomy API failed",
      file: "app/api/astronomy/route.ts",
      data: { error: err?.message ?? String(err) },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
