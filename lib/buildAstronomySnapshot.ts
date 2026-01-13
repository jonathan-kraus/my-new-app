// lib/buildAstronomySnapshot.ts
import { format } from "date-fns";
import { logit } from "@/lib/log/client";
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
  logit({
    level: "info",
    message: "In BAS",
    file: "lib/buildAstronomySnapshot.ts",

    page: "Build Astronomy",
    data: { t: { yyyy, mm, dd, hour, minute } },
  });
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

  return {
    // Normalize to local midnight to avoid timezone drift
    date: new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    ),

    // Solar
    sunrise: combineDateTime(targetDate, astro.sunrise),
    sunset: combineDateTime(targetDate, astro.sunset),

    sunriseBlueStart: combineDateTime(
      targetDate,
      astro.morning.blue_hour_begin,
    ),
    sunriseBlueEnd: combineDateTime(targetDate, astro.morning.blue_hour_end),
    sunriseGoldenStart: combineDateTime(
      targetDate,
      astro.morning.golden_hour_begin,
    ),
    sunriseGoldenEnd: combineDateTime(
      targetDate,
      astro.morning.golden_hour_end,
    ),

    sunsetBlueStart: combineDateTime(targetDate, astro.evening.blue_hour_begin),
    sunsetBlueEnd: combineDateTime(targetDate, astro.evening.blue_hour_end),
    sunsetGoldenStart: combineDateTime(
      targetDate,
      astro.evening.golden_hour_begin,
    ),
    sunsetGoldenEnd: combineDateTime(targetDate, astro.evening.golden_hour_end),

    // Lunar
    moonrise: normalizeMoonTime(astro.moonrise)
      ? combineDateTime(targetDate, astro.moonrise)
      : "",
    moonset: normalizeMoonTime(astro.moonset)
      ? combineDateTime(targetDate, astro.moonset)
      : "",
    moonPhase: calculateMoonPhase(targetDate),

    // Metadata
    fetchedAt: new Date(),
    locationId: location.id,
  };
}
