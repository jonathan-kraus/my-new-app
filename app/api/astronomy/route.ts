// app/api/astronomy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db"; // your DB client (not Prisma)
import { logit } from "@/lib/log/server";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: req.headers });
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Determine local date in America/New_York
    const now = new Date();
    const localISO = now.toLocaleString("sv-SE", {
      timeZone: "America/New_York",
    });
    const localDate = localISO.slice(0, 10); // "2026-01-12"

    // Build tomorrow's date
    const tomorrowDate = new Date(`${localDate}T00:00:00`);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowISO = tomorrowDate.toISOString().slice(0, 10);

    // Extract locationId from query params
    const searchParams = req.nextUrl.searchParams;
    const locationId = searchParams.get("locationId") ?? "WIL";

    // Query TODAY snapshot
    const today = await db.query(
      `
      SELECT *
      FROM "AstronomySnapshot"
      WHERE DATE("date") = $1
        AND "locationId" = $2
      LIMIT 1
      `,
      [localDate, locationId]
    );

    // Query TOMORROW snapshot
    const tomorrow = await db.query(
      `
      SELECT *
      FROM "AstronomySnapshot"
      WHERE DATE("date") = $1
        AND "locationId" = $2
      LIMIT 1
      `,
      [tomorrowISO, locationId]
    );

    const todayRow = today.rows[0] ?? null;
    const tomorrowRow = tomorrow.rows[0] ?? null;

    if (!todayRow) {
      await logit({
        level: "warn",
        message: "No astronomy snapshot found for today",
        file: "app/api/astronomy/route.ts",
        data: { localDate, locationId },
      });

      return NextResponse.json(
        { error: "No astronomy data for today" },
        { status: 404 }
      );
    }

    // Return clean JSON shape for the UI
    return NextResponse.json({
      today: {
        date: todayRow.date,
        sunrise: todayRow.sunrise,
        sunset: todayRow.sunset,
        moonrise: todayRow.moonrise,
        moonset: todayRow.moonset,
        sunriseBlueStart: todayRow.sunriseBlueStart,
        sunriseBlueEnd: todayRow.sunriseBlueEnd,
        sunriseGoldenStart: todayRow.sunriseGoldenStart,
        sunriseGoldenEnd: todayRow.sunriseGoldenEnd,
        sunsetGoldenStart: todayRow.sunsetGoldenStart,
        sunsetGoldenEnd: todayRow.sunsetGoldenEnd,
        sunsetBlueStart: todayRow.sunsetBlueStart,
        sunsetBlueEnd: todayRow.sunsetBlueEnd,
        moonPhase: todayRow.moonPhase,
      },
      tomorrow: tomorrowRow
        ? {
            date: tomorrowRow.date,
            sunrise: tomorrowRow.sunrise,
            sunset: tomorrowRow.sunset,
            moonrise: tomorrowRow.moonrise,
            moonset: tomorrowRow.moonset,
            sunriseBlueStart: tomorrowRow.sunriseBlueStart,
            sunriseBlueEnd: tomorrowRow.sunriseBlueEnd,
            sunriseGoldenStart: tomorrowRow.sunriseGoldenStart,
            sunriseGoldenEnd: tomorrowRow.sunriseGoldenEnd,
            sunsetGoldenStart: tomorrowRow.sunsetGoldenStart,
            sunsetGoldenEnd: tomorrowRow.sunsetGoldenEnd,
            sunsetBlueStart: tomorrowRow.sunsetBlueStart,
            sunsetBlueEnd: tomorrowRow.sunsetBlueEnd,
            moonPhase: tomorrowRow.moonPhase,
          }
        : null,
    });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Astronomy API failed",
      file: "app/api/astronomy/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
