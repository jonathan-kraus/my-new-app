// lib/ephemeris/writeEphemerisDebugEvent.ts

import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";
import { getConfig } from "@/lib/runtime/config";

let dl: number | null = null;

function loadDebugLevel() {
  if (dl !== null) return dl;

  try {
    const value = getConfig("debug.logging", "11");

    if (typeof value === "string" || typeof value === "number") {
      dl = Number(value);
      return dl;
    }

    dl = 11;
    return dl;
  } catch {
    dl = 11;
    return dl;
  }
}

const domain = "ephemeris";

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
// Main function
// -----------------------------
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
  moonPhase?: string | null;
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
  const debugLevel = loadDebugLevel();

  if (debugLevel === 1) {
    logit(domain, {
      level: "debug",
      message: "writeEphemerisDebugEvent called",
      data,
    });
  }

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

    if (debugLevel === 1) {
      logit(domain, {
        level: "debug",
        message: "writeEphemerisDebugEvent inserted row",
        data: { id: row.id },
      });
    }

    return row;
  } catch (err) {
    logit(domain, {
      level: "error",
      message: "writeEphemerisDebugEvent failed",
      data: { error: String(err) },
    });
    throw err;
  }
}
