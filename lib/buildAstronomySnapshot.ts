// lib/buildAstronomySnapshot.ts
import { format } from "date-fns";

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



export async function buildAstronomySnapshot(location: any, targetDate: Date) {
  const { latitude, longitude } = location;
  // Fetch astronomy data for this location/date
  const astro = await fetchIPGeoAstronomy(latitude, longitude, targetDate);

  // Force targetDate to local midnight (Eastern)
  const date = new Date( targetDate.getFullYear(),
  targetDate.getMonth(),
  targetDate.getDate() );
  return {
    
    date: new Date(
  Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0, 0, 0, 0
  )
),


    // Solar
    sunrise: combineDateTime(date, astro.sunrise),
    sunset: combineDateTime(date, astro.sunset),
    sunriseBlueStart: combineDateTime(date, astro.morning.blue_hour_begin),
    sunriseBlueEnd: combineDateTime(date, astro.morning.blue_hour_end),
    sunriseGoldenStart: combineDateTime(date, astro.morning.golden_hour_begin),
    sunriseGoldenEnd: combineDateTime(date, astro.morning.golden_hour_end),
    sunsetBlueStart: combineDateTime(date, astro.evening.blue_hour_begin),
    sunsetBlueEnd: combineDateTime(date, astro.evening.blue_hour_end),
    sunsetGoldenStart: combineDateTime(date, astro.evening.golden_hour_begin),
    sunsetGoldenEnd: combineDateTime(date, astro.evening.golden_hour_end),

    // Lunar
    moonrise: normalizeMoonTime(astro.moonrise) ? combineDateTime(date, astro.moonrise) : null, moonset: normalizeMoonTime(astro.moonset) ? combineDateTime(date, astro.moonset) : null, moonPhase: calculateMoonPhase(date),
    // Metadata
    fetchedAt: new Date(),
    locationId: location.id, }; }

function combineDateTime(date: Date, timeStr: string): string {
  const [hour, minute] = timeStr.split(":").map(Number);

  // Build a local Eastern Time date using Intl
  const eastern = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour + 5, // convert ET → UTC (ET = UTC-5)
      minute,
      0,
      0
    )
  );

  // Format as ISO with offset -05:00
  const iso = eastern.toLocaleString("sv-SE", {
    timeZone: "America/New_York",
    hour12: false,
  });

  // Convert "2026-01-21 07:59:00" → "2026-01-21T07:59:00-05:00"
  return iso.replace(" ", "T") + "-05:00";
}
