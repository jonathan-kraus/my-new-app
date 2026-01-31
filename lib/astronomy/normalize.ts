import { parseLocalTimestamp } from "@/lib/time";
export function parseLocalDate(dateStr: string): Date {
  // Accepts either "YYYY-MM-DD" or full ISO strings
  const iso = dateStr.split("T")[0]; // "2026-01-18"
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export interface RawAstronomyRow {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase?: number | null;
}
import type { AstronomySnapshot } from "../generated/prisma/client";

export function normalizeAstronomySnapshot(row: any) {
  if (!row) return null;

  return {
    id: row.id,
    date: row.date,
    createdAt: row.createdAt,
    locationId: row.locationId,
    fetchedAt: row.fetchedAt,

    sunrise: row.sunrise,
    sunset: row.sunset,
    solarNoon: row.solarNoon,

    sunriseBlueStart: row.sunriseBlueStart,
    sunriseBlueEnd: row.sunriseBlueEnd,
    sunsetBlueStart: row.sunsetBlueStart,
    sunsetBlueEnd: row.sunsetBlueEnd,

    sunriseGoldenStart: row.sunriseGoldenStart,
    sunriseGoldenEnd: row.sunriseGoldenEnd,
    sunsetGoldenStart: row.sunsetGoldenStart,
    sunsetGoldenEnd: row.sunsetGoldenEnd,

    moonrise: row.moonrise,
    moonset: row.moonset,
    moonPhase: row.moonPhase,

    illumination: row.illumination,
    phaseName: row.phaseName,
  };
}
