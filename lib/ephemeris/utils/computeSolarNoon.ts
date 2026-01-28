// lib/ephemeris/utils/computeSolarNoon.ts

export function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date(
    sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2,
  );
}
