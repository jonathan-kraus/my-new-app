import { parseLocalSolar } from "@/lib/solar/parseLocalSolar";

export function selectSolarDay(days: {
  date: string;
  sunrise: string;
  sunset: string;
}[]) {
  if (!days || days.length === 0) return null;

  const now = new Date();

  // Parse all days into usable objects
  const parsed = days.map((d) => ({
    date: new Date(d.date),
    sunrise: parseLocalSolar(d.sunrise),
    sunset: parseLocalSolar(d.sunset),
  }));

  // Sort by date
  parsed.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find today
  const today = parsed.find((d) =>
    d.date.getFullYear() === now.getFullYear() &&
    d.date.getMonth() === now.getMonth() &&
    d.date.getDate() === now.getDate()
  );

  if (!today) return null;

  // Find tomorrow
  const tomorrow = parsed.find((d) =>
    d.date.getFullYear() === today.date.getFullYear() &&
    d.date.getMonth() === today.date.getMonth() &&
    d.date.getDate() === today.date.getDate() + 1
  );

  return {
    date: today.date,
    sunrise: today.sunrise,
    sunset: today.sunset,
    nextSunrise: tomorrow ? tomorrow.sunrise : null,
  };
}
