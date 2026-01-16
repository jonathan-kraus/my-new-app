// lib/astronomy/normalize.ts
import { parseLocalTimestamp } from "@/lib/time";
import { parseLocalTimestampTomorrow } from "@/lib/time";
export function normalizeAstronomySnapshot(row: any) {
  console.log("🔭 RAW SNAPSHOT ROW:", row);

  const today = {
    sunrise: row.sunrise ?? null,
    sunset: row.sunset ?? null,
    moonrise: row.moonrise ?? null,
    moonset: row.moonset ?? null,
    moonPhase: row.moonPhase ?? null,
  };

  const tomorrow = {
    sunrise: row.tomorrowSunrise ?? null,
    moonrise: row.tomorrowMoonrise ?? null,
  };

  console.log("🌅 TODAY BEFORE PARSE:", today);
  console.log("🌙 TOMORROW BEFORE PARSE:", tomorrow);

  const parsedToday = {
    sunrise: parseLocalTimestamp(today.sunrise),
    sunset: parseLocalTimestamp(today.sunset),
    moonrise: parseLocalTimestamp(today.moonrise),
    moonset: parseLocalTimestamp(today.moonset),
    moonPhase: today.moonPhase,
  };

  const parsedTomorrow = {
    sunrise: parseLocalTimestampTomorrow(tomorrow.sunrise),
    moonrise: parseLocalTimestampTomorrow(tomorrow.moonrise),
  };

  console.log("🧭 TODAY AFTER PARSE:", parsedToday);
  console.log("🧭 TOMORROW AFTER PARSE:", parsedTomorrow);

  return { today: parsedToday, tomorrow: parsedTomorrow };
}
