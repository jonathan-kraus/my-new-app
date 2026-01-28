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
import { z } from "zod";

export const NormalizedAstronomySnapshotSchema = z.object({
  date: z.date(),

  // Solar
  sunriseDate: z.date().nullable(),
  sunsetDate: z.date().nullable(),
  nextSunrise: z.date().nullable(),
  nextSunset: z.date().nullable(),

  // Lunar
  moonriseDate: z.date().nullable(),
  moonsetDate: z.date().nullable(),
  nextMoonrise: z.date().nullable(),
  nextMoonset: z.date().nullable(),
  moonPhase: z.number().nullable(),
  // Metadata
  type: z.enum(["solar", "lunar"]).optional(),
});
