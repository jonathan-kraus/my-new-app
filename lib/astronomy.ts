// lib/astronomy.ts
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

const TOMORROWIO_APIKEY = process.env.TOMORROWIO_APIKEY!;
const TOMORROW_TIMELINE_URL = "https://api.tomorrow.io/v4/timelines";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  timezone: string; // e.g. "America/New_York" if you have it
};

type AstronomyDayInput = {
  date: Date;
  sunrise: Date;
  sunset: Date;
  moonrise?: Date | null;
  moonset?: Date | null;
};

type AstronomyDayComputed = AstronomyDayInput & {
  sunriseBlueStart: Date;
  sunriseBlueEnd: Date;
  sunriseGoldenStart: Date;
  sunriseGoldenEnd: Date;
  sunsetGoldenStart: Date;
  sunsetGoldenEnd: Date;
  sunsetBlueStart: Date;
  sunsetBlueEnd: Date;
};

function computeGoldenBlueHours(day: AstronomyDayInput): AstronomyDayComputed {
  const { date, sunrise, sunset, moonrise, moonset } = day;

  // You can tune these offsets however you like
  const minutes = (m: number) => m * 60 * 1000;

  const sunriseBlueStart = new Date(sunrise.getTime() - minutes(30));
  const sunriseBlueEnd = new Date(sunrise.getTime() - minutes(10));
  const sunriseGoldenStart = sunriseBlueEnd;
  const sunriseGoldenEnd = new Date(sunrise.getTime() + minutes(40));

  const sunsetGoldenStart = new Date(sunset.getTime() - minutes(40));
  const sunsetGoldenEnd = new Date(sunset.getTime() + minutes(10));
  const sunsetBlueStart = sunset;
  const sunsetBlueEnd = new Date(sunset.getTime() + minutes(30));

  return {
    date,
    sunrise,
    sunset,
    moonrise: moonrise ?? null,
    moonset: moonset ?? null,
    sunriseBlueStart,
    sunriseBlueEnd,
    sunriseGoldenStart,
    sunriseGoldenEnd,
    sunsetGoldenStart,
    sunsetGoldenEnd,
    sunsetBlueStart,
    sunsetBlueEnd,
  };
}

async function fetchAstronomyFromTomorrow(location: Location, days = 7) {
  const url = new URL("https://api.open-meteo.com/v1/astronomy");
  url.searchParams.set("latitude", location.latitude.toString());
  url.searchParams.set("longitude", location.longitude.toString());
  url.searchParams.set("timezone", location.timezone);
  url.searchParams.set("daily", [
    "sunrise",
    "sunset",
    "moonrise",
    "moonset",
    "moon_phase"
  ].join(","));
  url.searchParams.set("forecast_days", days.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const daysData: AstronomyDayInput[] = json.daily.time.map(
    (dateStr: string, i: number) => {
      const date = startOfDay(new Date(dateStr));

      const sunrise = json.daily.sunrise[i]
        ? new Date(json.daily.sunrise[i])
        : null;
      const sunset = json.daily.sunset[i]
        ? new Date(json.daily.sunset[i])
        : null;

      if (!sunrise || !sunset) {
        throw new Error("Missing sunrise/sunset in Open-Meteo response");
      }

      const moonrise = json.daily.moonrise[i]
        ? new Date(json.daily.moonrise[i])
        : null;
      const moonset = json.daily.moonset[i]
        ? new Date(json.daily.moonset[i])
        : null;

      return {
        date,
        sunrise,
        sunset,
        moonrise,
        moonset
      };
    }
  );

  return daysData;
}


export async function refreshAstronomySnapshotsForLocation(
  location: Location,
  days = 7,
) {
  const fetchedAt = new Date();
  const rawDays = await fetchAstronomyFromTomorrow(location, days);

  const computedDays = rawDays.map(computeGoldenBlueHours);

  const ops = computedDays.map((day) =>
    db.astronomySnapshot.upsert({
      where: {
        locationId_date: {
          locationId: location.id,
          date: day.date,
        },
      },
      create: {
        locationId: location.id,
        fetchedAt,
        date: day.date,
        sunrise: day.sunrise,
        sunset: day.sunset,
        moonrise: day.moonrise ?? undefined,
        moonset: day.moonset ?? undefined,
        sunriseBlueStart: day.sunriseBlueStart,
        sunriseBlueEnd: day.sunriseBlueEnd,
        sunriseGoldenStart: day.sunriseGoldenStart,
        sunriseGoldenEnd: day.sunriseGoldenEnd,
        sunsetGoldenStart: day.sunsetGoldenStart,
        sunsetGoldenEnd: day.sunsetGoldenEnd,
        sunsetBlueStart: day.sunsetBlueStart,
        sunsetBlueEnd: day.sunsetBlueEnd,
      },
      update: {
        fetchedAt,
        sunrise: day.sunrise,
        sunset: day.sunset,
        moonrise: day.moonrise ?? undefined,
        moonset: day.moonset ?? undefined,
        sunriseBlueStart: day.sunriseBlueStart,
        sunriseBlueEnd: day.sunriseBlueEnd,
        sunriseGoldenStart: day.sunriseGoldenStart,
        sunriseGoldenEnd: day.sunriseGoldenEnd,
        sunsetGoldenStart: day.sunsetGoldenStart,
        sunsetGoldenEnd: day.sunsetGoldenEnd,
        sunsetBlueStart: day.sunsetBlueStart,
        sunsetBlueEnd: day.sunsetBlueEnd,
      },
    }),
  );

  await db.$transaction(ops);

  return computedDays;
}

// Helper to fetch today + tomorrow for the dashboard
export async function getAstronomyForDashboard(
  locationId: string,
  now = new Date(),
) {
  const start = startOfDay(now);
  const tomorrow = startOfDay(addDays(now, 1));

  const snapshots = await db.astronomySnapshot.findMany({
    where: {
      locationId,
      date: { in: [start, tomorrow] },
    },
    orderBy: { date: "asc" },
  });

  const todaySnapshot =
    snapshots.find((s) => s.date.getTime() === start.getTime()) ?? null;
  const tomorrowSnapshot =
    snapshots.find((s) => s.date.getTime() === tomorrow.getTime()) ?? null;

  return { todaySnapshot, tomorrowSnapshot };
}
