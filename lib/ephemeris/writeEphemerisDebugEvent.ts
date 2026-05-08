// lib/ephemeris/writeEphemerisDebugEvent.ts

import { db } from "@/lib/db";

// -----------------------------
// Exported helpers for tests
// -----------------------------
export function toIsoString(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function toJsonSafe(value: unknown): any {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

// -----------------------------
// Logging helper (dynamic import to avoid server-only issues in tests)
// -----------------------------
async function logEphemerisEvent(
  level: "info" | "error",
  message: string,
  payload: any,
) {
  try {
    const { logj } = await import("@/lib/log/logj");
    const { staticUniversalContext } = await import("@/lib/log/buildj");

    const built = staticUniversalContext("EPHEMERIS");
    const jei = 0; // Reset for each call

    await logj({
      domain: "EPHEMERIS",
      level,
      message,
      file: "lib/ephemeris/writeEphemerisDebugEvent.ts",
      line: level === "info" ? 55 : 75,
      payload,
      meta: { built: { ...built, eventIndex: jei } },
    });
  } catch (logErr) {
    // Silently fail logging to avoid breaking the main functionality
    console.warn("Failed to log ephemeris event:", logErr);
  }
}

export type DebugEventInput = {
  raw: unknown;
  id: string;
  createdAt?: string | null;
  date?: string | null;
  locationId?: string | null;
  fetchedAt?: string | null;
  sunrise?: string | null;
  sunset?: string | null;
  moonrise?: string | null;
  moonset?: string | null;
  moonPhase?: number | null;
  sunriseBlueStart?: string | null;
  sunriseBlueEnd?: string | null;
  sunriseGoldenStart?: string | null;
  sunriseGoldenEnd?: string | null;
  sunsetGoldenStart?: string | null;
  sunsetGoldenEnd?: string | null;
  sunsetBlueStart?: string | null;
  sunsetBlueEnd?: string | null;
};

export async function writeEphemerisDebugEvent(data: DebugEventInput) {
  const now = new Date();

  try {
    const row = await db.ephemerisDebug.create({
      data: {
        raw: toJsonSafe(data.raw),
        id: data.id,
        createdAt: toIsoString(data.createdAt ?? null),
        date: toIsoString(data.date ?? null),
        locationId: data.locationId ?? null,
        fetchedAt: toIsoString(data.fetchedAt ?? null),
        sunrise: toIsoString(data.sunrise ?? null),
        sunset: toIsoString(data.sunset ?? null),
        moonrise: toIsoString(data.moonrise ?? null),
        moonset: toIsoString(data.moonset ?? null),
        moonPhase: data.moonPhase ?? null,
        sunriseBlueStart: toIsoString(data.sunriseBlueStart ?? null),
        sunriseBlueEnd: toIsoString(data.sunriseBlueEnd ?? null),
        sunriseGoldenStart: toIsoString(data.sunriseGoldenStart ?? null),
        sunriseGoldenEnd: toIsoString(data.sunriseGoldenEnd ?? null),
        sunsetGoldenStart: toIsoString(data.sunsetGoldenStart ?? null),
        sunsetGoldenEnd: toIsoString(data.sunsetGoldenEnd ?? null),
        sunsetBlueStart: toIsoString(data.sunsetBlueStart ?? null),
        sunsetBlueEnd: toIsoString(data.sunsetBlueEnd ?? null),
        receivedAt: now,
      },
    });

    // Log success asynchronously (don't await to avoid blocking)
    logEphemerisEvent("info", "Wrote ephemeris debug event", {
      id: data.id,
      locationId: data.locationId,
    });

    return row;
  } catch (err) {
    // Log error asynchronously (don't await to avoid blocking)
    logEphemerisEvent("error", "Failed to write ephemeris debug event", {
      id: data.id,
      locationId: data.locationId,
      error: err,
    });

    throw err;
  }
}
