// lib/ephemeris/utils/combineDateTime.ts

export function combineDateTime(date: string, time: string): string {
  // Example: date = "2026-01-22", time = "16:28:00"
  const [hour, minute, second] = time.split(":").map(Number);

  const dt = new Date(date);
  dt.setHours(hour, minute, second, 0);

  return dt.toISOString();
}
