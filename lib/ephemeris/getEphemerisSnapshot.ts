// lib/ephemeris/getEphemerisSnapshot.ts

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

export async function getEphemerisSnapshot(
  location: string,
): Promise<EphemerisSnapshot> {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  // Fetch today + tomorrow rows
  const rows = await db.astronomySnapshot.findMany({
    where: {
      locationId: location,
      date: {
        in: [new Date(today), new Date(tomorrow)],
      },
    },
    orderBy: { date: "asc" },
  });

  // Index by date
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

  // Build a normalized event
  function buildEvent(
    name: string,
    timestamp: string,
    type: "solar" | "lunar",
  ): EphemerisEvent {
    const zoned = toZonedTime(timestamp, TZ);

    return {
      name,
      timestamp,
      timeLocal: format(zoned, "h:mm a"),
      date: format(zoned, "yyyy-MM-dd"),
      isTomorrow: format(zoned, "yyyy-MM-dd") === tomorrow,
      type,
    };
  }

  // Solar snapshot
  const solar: SolarSnapshot = {
    sunrise: buildEvent("Sunrise", todayRow.sunrise, "solar"),
    sunset: buildEvent("Sunset", todayRow.sunset, "solar"),
  };

  // Lunar snapshot
  const lunar: LunarSnapshot = {
    moonrise: buildEvent("Moonrise", todayRow.moonrise, "lunar"),
    moonset: buildEvent("Moonset", todayRow.moonset, "lunar"),
    illumination: todayRow.illumination,
  };

  // Determine next event
  const allEvents: EphemerisEvent[] = [
    solar.sunrise,
    solar.sunset,
    lunar.moonrise,
    lunar.moonset,
  ];

  const now = Date.now();

  const nextEvent =
    allEvents
      .filter((e) => new Date(e.timestamp).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )[0] ||
    // fallback: tomorrow sunrise if today is exhausted
    (tomorrowRow
      ? buildEvent("Sunrise", tomorrowRow.sunrise, "solar")
      : solar.sunrise);

  return {
    solar,
    lunar,
    nextEvent,
    fetchedAt: new Date().toISOString(),
  };
}
