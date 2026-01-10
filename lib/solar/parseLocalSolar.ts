// lib/solar/parseLocalSolar.ts

export function parseLocalSolar(value: string | null): Date | null {
  if (!value || value.trim() === "") return null;

  // Normalize "YYYY-MM-DD HH:mm:ss" into a format JS can reliably parse
  // Replace space with "T" to avoid UTC coercion
  const normalized = value.replace(" ", "T");

  const dt = new Date(normalized);

  if (isNaN(dt.getTime())) {
    return null;
  }

  return dt;
}
