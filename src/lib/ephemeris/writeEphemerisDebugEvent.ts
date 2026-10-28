// lib/ephemeris/writeEphemerisDebugEvent.ts

import { Temporal } from "temporal-polyfill";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import type { JsonValue } from "@prisma/orm-postgres/target/codec-types";
// -----------------------------
// Exported helpers for tests
// -----------------------------
export function toIsoString(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function toJsonSafe(value: unknown): JsonValue {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}
const { staticUniversalContext } = await import("@/lib/log/buildj");
const built = staticUniversalContext("ephemeris");
let jei = 0;

await logj({
  domain: "ephemeris",
  level: "info",
  message: "Wrote ephemeris start debug event",
  file: "src/lib/ephemeris/writeEphemerisDebugEvent.ts",
  line: 27,
  payload: { receivedAt: "data" },
  meta: { built: { ...built, eventIndex: ++jei } },
});

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
  // Timestamp(3) expects a PlainDateTime; store the receipt time in UTC.
  const now = Temporal.Instant.from(new Date().toISOString())
    .toZonedDateTimeISO("UTC")
    .toPlainDateTime();
  console.log("writeEphemerisDebugEvent: called with data", data);
  try {
    const row = await db8.orm.public.EphemerisDebug.create({
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
    });

    await logj({
      domain: "ephemeris",
      level: "info",
      message: "Wrote ephemeris end debug event",
      file: "src/lib/ephemeris/writeEphemerisDebugEvent.ts",
      line: 89,
      payload: { receivedAt: row.receivedAt },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return row;
  } catch (err) {
    throw err;
  }
}
