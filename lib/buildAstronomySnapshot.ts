import type { AstronomySnapshot } from "@prisma/client";

function formatLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function buildAstronomySnapshot(
  day: {
    date: Date;
    sunrise: Date;
    sunset: Date;
    moonrise: Date | null;
    moonset: Date | null;
    moonPhase: number;
    goldenMorningStart: Date;
    goldenMorningEnd: Date;
    goldenEveningStart: Date;
    goldenEveningEnd: Date;
  },
  locationId: string,
): Omit<AstronomySnapshot, "id"> {
  return {
    locationId,
    createdAt: new Date(),
    fetchedAt: new Date(),
    date: day.date,

    // Core timestamps as strings
    sunrise: formatLocal(day.sunrise),
    sunset: formatLocal(day.sunset),
    moonrise: day.moonrise ? formatLocal(day.moonrise) : null,
    moonset: day.moonset ? formatLocal(day.moonset) : null,
    moonPhase: day.moonPhase,

    // Golden hour
    sunriseGoldenStart: formatLocal(day.goldenMorningStart),
    sunriseGoldenEnd: formatLocal(day.goldenMorningEnd),
    sunsetGoldenStart: formatLocal(day.goldenEveningStart),
    sunsetGoldenEnd: formatLocal(day.goldenEveningEnd),

    // Blue hour (placeholder)
    sunriseBlueStart: formatLocal(day.sunrise),
    sunriseBlueEnd: formatLocal(day.sunrise),
    sunsetBlueStart: formatLocal(day.sunset),
    sunsetBlueEnd: formatLocal(day.sunset),
  };
}
