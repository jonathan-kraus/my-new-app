// lib/solar/parseLocalSolar.ts

// Expects a string like "2026-01-11 07:22:00"
// and returns a local Date for that exact moment.
export function parseLocalSolar(dateTimeStr: string): Date {
  if (!dateTimeStr) {
    return new Date(NaN);
  }

  const [datePart, timePart] = dateTimeStr.split(" ");

  if (!datePart || !timePart) {
    return new Date(NaN);
  }

  const [yearStr, monthStr, dayStr] = datePart.split("-");
  const [hourStr, minuteStr, secondStr] = timePart.split(":");

  const year = Number(yearStr);
  const month = Number(monthStr) - 1; // JS months are 0-based
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr ?? "0");

  return new Date(year, month, day, hour, minute, second);
}
