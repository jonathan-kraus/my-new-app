// lib/buildAstronomySnapshot.ts
import { format } from "date-fns";
import { logit } from "@/lib/log/server";

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

function combineDateTime(date: Date, timeStr: string): string {
  const [hour, minute] = timeStr.split(":");
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hour}:${minute}:00`;
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
  const astro = await fetchIPGeoAstronomy(latitude, longitude, targetDate);

  await logit({
    level: "info",
    message: "Fetched IPGeo astronomy",
    file: "lib/buildAstronomySnapshot.ts",
    page: "Build Astronomy",
    data: { astro },
  });

  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  // Build solar object
  const solar = {
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

    // Legacy fields your UI expects but you don't compute
    nextSunrise: null,
    correctedSunrise: null,

