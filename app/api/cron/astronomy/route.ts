import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { addDays, format } from "date-fns";

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
// IPGeolocation Fetcher
// -----------------------------

async function fetchIPGeoAstronomy(lat: number, lon: number, date: Date) {
  const day = format(date, "yyyy-MM-dd");

  const url = new URL("https://api.ipgeolocation.io/v2/astronomy");
  url.searchParams.set("apiKey", process.env.IPGEO_API_KEY!);
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("long", lon.toString());
  url.searchParams.set("date", day);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`IPGeolocation error: ${res.status}`);
  }

  const json = await res.json();
  return json.astronomy;
}

// -----------------------------
// Snapshot Builder
// -----------------------------

async function buildAstronomySnapshot(location: any, targetDate: Date) {
  const { latitude, longitude } = location;

  const astro = await fetchIPGeoAstronomy(latitude, longitude, targetDate);

  return {
    date: targetDate,

    // Solar
    sunrise: astro.sunrise,
    sunset: astro.sunset,

    sunriseBlueStart: astro.morning.blue_hour_begin,
    sunriseBlueEnd: astro.morning.blue_hour_end,
    sunriseGoldenStart: astro.morning.golden_hour_begin,
    sunriseGoldenEnd: astro.morning.golden_hour_end,

    sunsetBlueStart: astro.evening.blue_hour_begin,
    sunsetBlueEnd: astro.evening.blue_hour_end,
    sunsetGoldenStart: astro.evening.golden_hour_begin,
    sunsetGoldenEnd: astro.evening.golden_hour_end,

    // Lunar
    moonrise: normalizeMoonTime(astro.moonrise),
    moonset: normalizeMoonTime(astro.moonset),
    moonPhase: calculateMoonPhase(targetDate),

    // Metadata
    fetchedAt: new Date(),
    locationId: location.id,
  };
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
    line: 20,
    page: "Astronomy Cron Job",
    data: {},
  });

  const locations = await db.location.findMany();

  for (const location of locations) {
    await logit({
      level: "info",
      message: "astronomy.cron.location.started",
      file: "app/api/cron/astronomy/route.ts",
      line: 45,
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
        line: 78,
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
    line: 110,
    page: "Astronomy Cron Job",
    data: { durationMs: ms },
  });

  return NextResponse.json({ ok: true, durationMs: ms });
}
