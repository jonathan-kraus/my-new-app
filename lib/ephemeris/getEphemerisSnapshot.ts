import { db } from "@/lib/db";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import type {
  EphemerisEvent,
  SolarSnapshot,
  LunarSnapshot,
  EphemerisSnapshot,
} from "./types";

const TZ = "America/New_York";

// ---------------------------------------------------------
// Safe date helper — prevents RangeError: Invalid time value
// ---------------------------------------------------------
function safeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ---------------------------------------------------------
// Safe event builder — returns null instead of throwing
// ---------------------------------------------------------
function safeBuildEvent(
  name: string,
  timestamp: string | null,
  type: "solar" | "lunar",
  tomorrow: string,
): EphemerisEvent | null {
  const ts = safeDate(timestamp);
  if (!ts) return null;

  const zoned = toZonedTime(ts, TZ);

  return {
    name,
    timestamp: ts,
    timeLocal: format(zoned, "h:mm a"),
    date: format(zoned, "yyyy-MM-dd"),
    isTomorrow: format(zoned, "yyyy-MM-dd") === tomorrow,
    type,
  };
}

export async function getEphemerisSnapshot(
  location: string,
): Promise<EphemerisSnapshot> {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  const rows = await db.astronomySnapshot.findMany({
    where: {
      locationId: location,
      date: {
        in: [new Date(today), new Date(tomorrow)],
      },
    },
    orderBy: { date: "asc" },
  });

  const byDate: Record<string, any> = {};
  for (const r of rows) {
    const key = format(r.date, "yyyy-MM-dd");
    byDate[key] = r;
  }

  const todayRow = byDate[today];
  const tomorrowRow = byDate[tomorrow];

  if (!todayRow) {
    throw new Error(`No ephemeris row found for ${location} on ${today}`);
  }

  // ---------------------------------------------------------
  // Solar snapshot (safe because sunrise/sunset always exist)
  // ---------------------------------------------------------
  const solar: SolarSnapshot = {
    sunrise: safeBuildEvent("Sunrise", todayRow.sunrise, "solar", tomorrow)!,
    sunset: safeBuildEvent("Sunset", todayRow.sunset, "solar", tomorrow)!,
  };

  // ---------------------------------------------------------
  // Lunar snapshot (now fully safe)
  // ---------------------------------------------------------
  const lunar: LunarSnapshot = {
    date: today,
    moonrise: safeBuildEvent("Moonrise", todayRow.moonrise, "lunar", tomorrow),
    moonset: safeBuildEvent("Moonset", todayRow.moonset, "lunar", tomorrow),

    illumination: todayRow.illumination ?? null,
  };

  // ---------------------------------------------------------
  // Determine next event (skip null lunar events)
  // ---------------------------------------------------------
  const allEvents: EphemerisEvent[] = [
    solar.sunrise,
    solar.sunset,
    lunar.moonrise,
    lunar.moonset,
  ].filter(Boolean) as EphemerisEvent[];

  const now = Date.now();

  const nextEvent =
    allEvents
      .filter((e) => new Date(e.timestamp).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )[0] ||
    (tomorrowRow
      ? safeBuildEvent("Sunrise", tomorrowRow.sunrise, "solar", tomorrow)
      : solar.sunrise);

  return {
    solar,
    lunar,
    nextEvent: nextEvent!,
    fetchedAt: new Date().toISOString(),
  };
}
