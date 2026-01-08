import { parseLocalSolar } from "./parseLocalSolar";
export function selectSolarDay(
  days: { date: string; sunrise: string; sunset: string }[],
) {
  const now = new Date();

  // Convert to local dates
  const localDays = days.map((d) => ({
    date: new Date(d.date),
    sunrise: parseLocalSolar(d.sunrise),
    sunset: parseLocalSolar(d.sunset),
  }));

  // Find today
  const today = localDays.find(
    (d) => d.date.toDateString() === now.toDateString(),
  );

  if (!today) return null;

  // If before sunrise → next event is today's sunrise
  if (now < today.sunrise) {
    return { ...today, next: "sunrise" };
  }

  // If before sunset → next event is today's sunset
  if (now < today.sunset) {
    return { ...today, next: "sunset" };
  }

  // Otherwise → tomorrow's sunrise
  const tomorrow = localDays.find(
    (d) =>
      d.date.toDateString() ===
      new Date(today.date.getTime() + 86400000).toDateString(),
  );

  if (tomorrow) {
    return { ...tomorrow, next: "sunrise" };
  }

  return null;
}
