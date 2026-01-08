// Returns a number 0–7 representing the moon phase
export function getMoonPhaseIndex(date: Date): number {
  // Algorithm: Conway / Simple Lunation
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  let r = year % 100;
  r %= 19;

  if (r > 9) r -= 19;

  r = ((r * 11) % 30) + month + day;

  if (month < 3) r += 2;

  const phase = r % 30;

  // Convert 0–29 into 0–7 buckets
  if (phase < 1) return 0; // New Moon
  if (phase < 7) return 1; // Waxing Crescent
  if (phase < 9) return 2; // First Quarter
  if (phase < 15) return 3; // Waxing Gibbous
  if (phase < 17) return 4; // Full Moon
  if (phase < 23) return 5; // Waning Gibbous
  if (phase < 25) return 6; // Last Quarter
  return 7; // Waning Crescent
}

export function getMoonPhaseIcon(date: Date): string {
  const idx = getMoonPhaseIndex(date);
  return [
    "🌑", // 0 New Moon
    "🌒", // 1 Waxing Crescent
    "🌓", // 2 First Quarter
    "🌔", // 3 Waxing Gibbous
    "🌕", // 4 Full Moon
    "🌖", // 5 Waning Gibbous
    "🌗", // 6 Last Quarter
    "🌘", // 7 Waning Crescent
  ][idx];
}

export function getMoonPhaseName(date: Date): string {
  const idx = getMoonPhaseIndex(date);
  return [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ][idx];
}
