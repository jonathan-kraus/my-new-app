// lib\astronomy\types.ts
export interface SolarDay {
  sunrise: string | null;
  sunset: string | null;
  nextSunrise: string | null;
}

export interface LunarDay {
  moonrise: string | null;
  moonset: string | null;
  nextMoonrise: string | null;
}

export interface NormalizedAstronomySnapshot {
  sunriseDate: Date | null;
  sunsetDate: Date | null;
  moonriseDate: Date | null;
  moonsetDate: Date | null;
  moonPhase?: number | null;
}

export interface AstronomyCardProps {
  today: NormalizedAstronomySnapshot | null;
  tomorrow: NormalizedAstronomySnapshot | null;
}
export interface DashboardAstronomyClientProps {
  today: NormalizedAstronomySnapshot | null;
  tomorrow: NormalizedAstronomySnapshot | null;
}
