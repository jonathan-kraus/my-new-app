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

  const row = await db.ephemerisDebug.create({
    data: {
      raw: data.raw as any,
      id: data.id,
      createdAt: data.createdAt ?? null,
      date: data.date ?? null,
      locationId: data.locationId ?? null,
      fetchedAt: data.fetchedAt ?? null,
      sunrise: data.sunrise ?? null,
      sunset: data.sunset ?? null,
      moonrise: data.moonrise ?? null,
      moonset: data.moonset ?? null,
      moonPhase: data.moonPhase ?? null,
      sunriseBlueStart: data.sunriseBlueStart ?? null,
      sunriseBlueEnd: data.sunriseBlueEnd ?? null,
      sunriseGoldenStart: data.sunriseGoldenStart ?? null,
      sunriseGoldenEnd: data.sunriseGoldenEnd ?? null,
      sunsetGoldenStart: data.sunsetGoldenStart ?? null,
      sunsetGoldenEnd: data.sunsetGoldenEnd ?? null,
      sunsetBlueStart: data.sunsetBlueStart ?? null,
      sunsetBlueEnd: data.sunsetBlueEnd ?? null,
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
}
