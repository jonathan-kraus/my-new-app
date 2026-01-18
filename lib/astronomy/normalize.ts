import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";

interface RawAstronomyRow {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase?: number | null;
  tomorrowSunrise?: string | null;
  tomorrowSunset?: string | null;
  tomorrowMoonrise?: string | null;
  tomorrowMoonset?: string | null;
}

export function normalizeAstronomySnapshot(row: RawAstronomyRow) {
  const today = {
    sunriseDate: parseLocalTimestamp(row.sunrise),
    sunsetDate: parseLocalTimestamp(row.sunset),
    moonriseDate: parseLocalTimestamp(row.moonrise),
    moonsetDate: parseLocalTimestamp(row.moonset),
    moonPhase: row.moonPhase ?? null,
  };

  const tomorrow = {
    sunriseDate: parseLocalTimestampTomorrow(row.tomorrowSunrise),
    sunsetDate: parseLocalTimestampTomorrow(row.tomorrowSunset),
    moonriseDate: parseLocalTimestampTomorrow(row.tomorrowMoonrise),
    moonsetDate: parseLocalTimestampTomorrow(row.tomorrowMoonset),
  };

  return { today, tomorrow };
}
