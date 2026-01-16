export function formatTime(value: Date | string | null | undefined): string {
  if (!value) return "—";

  // Convert "2026-01-10 07:21:00" → "2026-01-10T07:21:00Z"
  const date =
    value instanceof Date ? value : new Date(value.replace(" ", "T") + "Z");

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
