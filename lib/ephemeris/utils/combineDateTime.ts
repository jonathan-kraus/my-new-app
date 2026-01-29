// lib/ephemeris/utils/combineDateTime.ts

export function combineDateTime(date: Date, timeString: string): Date {
  const [h, m, s] = timeString.split(":").map(Number);
  const dt = new Date(date);
  dt.setHours(h, m, s ?? 0, 0);
  return dt;
}
