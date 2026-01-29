// lib/astronomy/buildAstronomySnapshot.ts

import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";
import { format } from "date-fns";
function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2);
}

export async function buildAstronomySnapshot(
  location: { id: string; latitude: number; longitude: number },
  targetDate: Date,
) {
  const { latitude, longitude } = location;

  // Normalize date to local midnight
  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
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

  // Fetch astronomy data from IPGeolocation
  const astro = await fetchIPGeoAstronomy(latitude, longitude, date);

  //
  // --- SOLAR TIMES ---
  //
  const sunrise = combineDateTime(date, astro.sunrise); // Date
  const sunset = combineDateTime(date, astro.sunset); // Date
  const solarNoon = computeSolarNoon(sunrise, sunset); // Date

  //
  // --- BLUE HOUR ---
  //
  const sunriseBlueStart = combineDateTime(date, astro.morning.blue_hour_begin);
  const sunriseBlueEnd = combineDateTime(date, astro.morning.blue_hour_end);
  const sunsetBlueStart = combineDateTime(date, astro.evening.blue_hour_begin);
  const sunsetBlueEnd = combineDateTime(date, astro.evening.blue_hour_end);

  //
  // --- GOLDEN HOUR ---
  //
  const sunriseGoldenStart = combineDateTime(
    date,
    astro.morning.golden_hour_begin,
  );
  const sunriseGoldenEnd = combineDateTime(date, astro.morning.golden_hour_end);
  const sunsetGoldenStart = combineDateTime(
    date,
    astro.evening.golden_hour_begin,
  );
  const sunsetGoldenEnd = combineDateTime(date, astro.evening.golden_hour_end);

  //
  // --- LUNAR ---
  //
  const moonrise = astro.moonrise
    ? combineDateTime(date, astro.moonrise)
    : null;

  const moonset = astro.moonset ? combineDateTime(date, astro.moonset) : null;

  const illumination = astro.moon_illumination ?? null;
  const phaseName = astro.moon_phase_name ?? null;
  const moonPhase = calculateMoonPhase(date);

  //
  // --- FINAL SNAPSHOT OBJECT ---
  //
  return {
    date,
    locationId: location.id,
    fetchedAt: new Date(),

    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    solarNoon: solarNoon.toISOString(),

    sunriseBlueStart: sunriseBlueStart.toISOString(),
    sunriseBlueEnd: sunriseBlueEnd.toISOString(),
    sunsetBlueStart: sunsetBlueStart.toISOString(),
    sunsetBlueEnd: sunsetBlueEnd.toISOString(),

    sunriseGoldenStart: sunriseGoldenStart.toISOString(),
    sunriseGoldenEnd: sunriseGoldenEnd.toISOString(),
    sunsetGoldenStart: sunsetGoldenStart.toISOString(),
    sunsetGoldenEnd: sunsetGoldenEnd.toISOString(),

    moonrise: moonrise ? moonrise.toISOString() : null,
    moonset: moonset ? moonset.toISOString() : null,

    illumination,
    phaseName,
    moonPhase,
  };
}
