export function getPhaseName(illumination: number | null): string {
  if (illumination === null) return "Unknown";

  if (illumination <= 1) return "New Moon";
  if (illumination <= 24) return "Waxing Crescent";
  if (illumination <= 26) return "First Quarter";
  if (illumination <= 49) return "Waxing Gibbous";
  if (illumination <= 51) return "Full Moon";
  if (illumination <= 74) return "Waning Gibbous";
  if (illumination <= 76) return "Last Quarter";
  return "Waning Crescent";
}
