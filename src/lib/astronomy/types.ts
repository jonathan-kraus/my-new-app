// lib/astronomy/types.ts
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
export const excludeTables = [
  "Account",
  "UserRole",
  "User",
  "Session",
  "verification",
  "VerificationToken",
  "pg_stat_statements",
];
export interface NormalizedAstronomySnapshot {
  sunrise: string | null; // "05:07:00" or "2026-02-21T17:07:00-05:00"
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
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
import { z } from "zod";

export const NormalizedAstronomySnapshotSchema = z.object({
  id: z.string(),
  date: z.string(), // or dateString if you prefer
  createdAt: z.string(),
  locationId: z.string(),
  fetchedAt: z.string(),

  sunrise: z.string().nullable(),
  sunset: z.string().nullable(),
  solarNoon: z.string().nullable(),

  sunriseBlueStart: z.string().nullable(),
  sunriseBlueEnd: z.string().nullable(),
  sunriseGoldenStart: z.string().nullable(),
  sunriseGoldenEnd: z.string().nullable(),

  sunsetGoldenStart: z.string().nullable(),
  sunsetGoldenEnd: z.string().nullable(),
  sunsetBlueStart: z.string().nullable(),
  sunsetBlueEnd: z.string().nullable(),

  moonrise: z.string().nullable(),
  moonset: z.string().nullable(),
  moonPhase: z.number().nullable(),

  illumination: z.number().nullable(),
  phaseName: z.string().nullable(),
});
