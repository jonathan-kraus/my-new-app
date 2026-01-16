export function normalizeTimestamp(value: string | null): Date | null {
  if (!value) return null;

  // Convert "2026-01-10 07:21:00" → "2026-01-10T07:21:00Z"
  const iso = value.replace(" ", "T") + "Z";

  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
