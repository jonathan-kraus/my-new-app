// lib/time.ts

// Parse "2026-01-10 07:21:00" as a LOCAL time (no timezone shifting)
export function parseLocalTimestamp(ts: string | null | undefined) {
  if (!ts || typeof ts !== "string") return null;

  const trimmed = ts.trim();
  const parts = trimmed.split(" ");

  if (parts.length !== 2) return null;

  const [date, time] = parts;

  const dateParts = date.split("-");
  const timeParts = time.split(":");

  if (dateParts.length !== 3 || timeParts.length < 2) return null;

  const [year, month, day] = dateParts.map(Number);
  const [hour, minute, second = 0] = timeParts.map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

// Parse tomorrow's timestamp as LOCAL time and ensure it's actually tomorrow
export function parseLocalTimestampTomorrow(ts: string | null | undefined) {
  const d = parseLocalTimestamp(ts);
  if (!d) return null;
  d.setDate(d.getDate() + 1);
  return d;
}

export function formatLocal(d: Date | null | undefined) {
  return d ? d.toLocaleTimeString() : "—";
}

export function msUntil(date: Date) {
  return date.getTime() - Date.now();
}

export function msSince(date: Date) {
  return Date.now() - date.getTime();
}

export function isPast(date: Date) {
  return date.getTime() < Date.now();
}

export function isFuture(date: Date) {
  return date.getTime() > Date.now();
}

export function isNow(start: Date, end: Date) {
  const now = Date.now();
  return start.getTime() <= now && now <= end.getTime();
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "Now";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const h = hours % 24;
  const m = minutes % 60;

  if (days > 0) return `${days}d ${h}h ${m}m`;
  if (hours > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
