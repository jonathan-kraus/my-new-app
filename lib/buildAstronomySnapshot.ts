import type { AstronomySnapshot } from "@prisma/client";

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

    // Core timestamps
    date: day.date,
    fetchedAt: new Date(),

    sunrise: day.sunrise,
    sunset: day.sunset,
    moonrise: day.moonrise,
    moonset: day.moonset,
    moonPhase: day.moonPhase,

    // Golden hour (morning/evening)
    sunriseGoldenStart: day.goldenMorningStart,
    sunriseGoldenEnd: day.goldenMorningEnd,
    sunsetGoldenStart: day.goldenEveningStart,
    sunsetGoldenEnd: day.goldenEveningEnd,

    // Blue hour (placeholder until we compute real twilight)
    sunriseBlueStart: day.sunrise,
    sunriseBlueEnd: day.sunrise,
    sunsetBlueStart: day.sunset,
    sunsetBlueEnd: day.sunset,
  };
}
