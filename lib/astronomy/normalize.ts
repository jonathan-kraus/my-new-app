import { parseLocalTimestamp } from "@/lib/time";
export function parseLocalDate(dateStr: string): Date {
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export interface RawAstronomyRow { date: string; sunrise: string | null; sunset: string | null; moonrise: string | null; moonset: string | null; moonPhase?: number | null; }
export function normalizeAstronomySnapshot(
  todayRow: RawAstronomyRow,
  tomorrowRow: RawAstronomyRow | null
) {
  const today = {
    date: parseLocalDate(todayRow.date),
    sunriseDate: parseLocalTimestamp(todayRow.sunrise),
    sunsetDate: parseLocalTimestamp(todayRow.sunset),
    moonriseDate: parseLocalTimestamp(todayRow.moonrise),
    moonsetDate: parseLocalTimestamp(todayRow.moonset),
    moonPhase: todayRow.moonPhase ?? null,
  };

  const tomorrow = {
    nextSunrise: tomorrowRow
      ? parseLocalTimestamp(tomorrowRow.sunrise)
      : null,
    nextSunset: tomorrowRow
      ? parseLocalTimestamp(tomorrowRow.sunset)
      : null,
    nextMoonrise: tomorrowRow
      ? parseLocalTimestamp(tomorrowRow.moonrise)
      : null,
    nextMoonset: tomorrowRow
      ? parseLocalTimestamp(tomorrowRow.moonset)
      : null,
  };

  return {
    ...today,
    ...tomorrow,
  };
}
