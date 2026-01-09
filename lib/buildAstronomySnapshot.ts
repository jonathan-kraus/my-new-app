import type { AstronomySnapshot } from "@prisma/client";
import { getUSNOMoonData } from "@/lib/lunar/usno";
function formatLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
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
  const lunar = await getUSNOMoonData(lat, lon, localDate);

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

    moonrise: lunar.moonrise ?? undefined,
    moonset: lunar.moonset ?? undefined,
    moonPhase,

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
