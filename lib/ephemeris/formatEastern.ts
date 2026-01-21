export function formatEastern(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour12: true,
  });
}
