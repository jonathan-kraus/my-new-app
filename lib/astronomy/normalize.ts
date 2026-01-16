// lib/astronomy/normalize.ts

import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";

export function normalizeAstronomySnapshot(row: any) {
  const today = {
    sunrise: parseLocalTimestamp(row.sunrise),
    sunset: parseLocalTimestamp(row.sunset),
    moonrise: row.moonrise ? parseLocalTimestamp(row.moonrise) : null,
    moonset: row.moonset ? parseLocalTimestamp(row.moonset) : null,
    moonPhase: row.moonPhase ?? null,
  };

  const tomorrow = {
    sunrise: parseLocalTimestampTomorrow(row.tomorrowSunrise),
    moonrise: row.tomorrowMoonrise
      ? parseLocalTimestampTomorrow(row.tomorrowMoonrise)
      : null,
  };

  return { today, tomorrow };
}
