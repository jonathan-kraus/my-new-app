// lib/format.ts

// Always format in America/New_York
const ET = "America/New_York";

// Full timestamp: "1/21/2026, 6:38:00 AM"
export function formatEastern(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: ET,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

// Short time: "6:38 AM"
export function formatEasternTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: ET,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

// Date only: "1/21/2026"
export function formatEasternDate(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: ET,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

// Relative duration: "2h 13m remaining"
export function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
