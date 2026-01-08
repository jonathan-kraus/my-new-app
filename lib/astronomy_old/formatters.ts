// lib/astronomy/formatters.ts

//
// Basic time formatting
//

/** Format a Date as "7:23 AM" */
export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format a Date as "07:23:38 AM" */
export function formatTimeWithSeconds(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Format a Date as "Jan 4, 2026" */
export function formatDate(d?: string | Date): string {
  if (!d) return "Unknown time";

  const date = d instanceof Date ? d : new Date(d);

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

//
// Duration formatting
//

/** Convert minutes → "1h 22m" or "22m" */
export function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Convert milliseconds → "1h 22m" */
export function formatDurationMs(ms: number): string {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  return formatDurationMinutes(totalMinutes);
}

//
// Countdown formatting
//

/** Format a countdown between two dates */
export function formatCountdown(from: Date, to: Date): string {
  const diffMs = to.getTime() - from.getTime();
  if (diffMs <= 0) return "0m";

  return formatDurationMs(diffMs);
}

//
// Range formatting
//

/** Format a time range like "7:23 AM – 8:23 AM" */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

//
// Parsing helpers
//

/** Safe date parsing with fallback */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    console.warn("Invalid date parsed:", value);
    return new Date(0);
  }
  return d;
}

//
// Zero‑padding helpers
//

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

//
// AM/PM helpers
//

export function isAM(d: Date): boolean {
  return d.getHours() < 12;
}

export function isPM(d: Date): boolean {
  return d.getHours() >= 12;
}

//
// Relative time formatting
//

/** "Updated 12:48:38 AM" */
export function formatUpdated(d: Date): string {
  return `Updated ${formatTimeWithSeconds(d)}`;
}

//
// Progress helpers
//

/** Compute percent progress between two dates */
export function computeProgress(start: Date, end: Date, now: Date): number {
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
// Helper to shift time
export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
