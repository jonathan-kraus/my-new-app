import type { AstronomySnapshot } from "@prisma/client";
import { getIPGeoAstronomy } from "@/lib/lunar/ipgeo";
export function calculateMoonPhase(date: Date): number {
  // Convert to UTC midnight
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Astronomical algorithm (simple, accurate to ~1 hour)
  let r = year % 100;
  r %= 19;

  if (r > 9) {
    r -= 19;
  }

  r = ((r * 11) % 30) + month + day;

  if (month < 3) {
    r += 2;
  }

  const phase = (r < 0 ? r + 30 : r) / 30;

  return Number(phase.toFixed(4));
}

export async function buildAstronomySnapshot(
  lat: number,
  lon: number,
  localDate: Date,
  moonPhase: number,
  solar: {
    sunrise: Date;
    sunset: Date;
    sunriseBlueStart: Date;
    sunriseBlueEnd: Date;
    sunriseGoldenStart: Date;
    sunriseGoldenEnd: Date;
    sunsetGoldenStart: Date;
    sunsetGoldenEnd: Date;
    sunsetBlueStart: Date;
    sunsetBlueEnd: Date;
  },
  locationId: string,
) {
  const astro = await getIPGeoAstronomy(lat, lon, localDate);

  const fmt = (d: Date | null): string =>
    d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate(),
        ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes(),
        ).padStart(2, "0")}:00`
      : "";

  return {
    date: localDate,

    sunrise: fmt(solar.sunrise),
    sunset: fmt(solar.sunset),

    moonrise: astro.moonrise ?? undefined,
    moonset: astro.moonset ?? undefined,
    moonPhase: calculateMoonPhase(localDate),

    sunriseBlueStart: fmt(solar.sunriseBlueStart),
    sunriseBlueEnd: fmt(solar.sunriseBlueEnd),
    sunriseGoldenStart: fmt(solar.sunriseGoldenStart),
    sunriseGoldenEnd: fmt(solar.sunriseGoldenEnd),

    sunsetGoldenStart: fmt(solar.sunsetGoldenStart),
    sunsetGoldenEnd: fmt(solar.sunsetGoldenEnd),
    sunsetBlueStart: fmt(solar.sunsetBlueStart),
    sunsetBlueEnd: fmt(solar.sunsetBlueEnd),

    fetchedAt: new Date(),
    locationId,
  };
}
