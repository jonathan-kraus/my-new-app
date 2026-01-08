// lib/time.ts

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
