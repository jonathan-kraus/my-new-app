// lib/ephemeris/getEphemerisSnapshot.ts

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const TZ = "America/New_York";

export type EphemerisEvent = {
  name: string;
  timestamp: string;        // full ISO from DB
  timeLocal: string;        // "7:16 AM"
  date: string;             // "2026-01-23"
  isTomorrow: boolean;
  type: "solar" | "lunar";
};

export type EphemerisSnapshot = {
  solar: {
    sunrise: EphemerisEvent;
    sunset: EphemerisEvent;
  };
  lunar: {
    moonrise: EphemerisEvent;
    moonset: EphemerisEvent;
    illumination: number;
  };
  nextEvent: EphemerisEvent;
  fetchedAt: string;
};

export async function getEphemerisSnapshot(location: string): Promise<EphemerisSnapshot> {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  const rows = await prisma.ephemeris.findMany({
    where: { location, date: { in: [today, tomorrow] } },
    orderBy: { date: "asc" }
  });

  const byDate = Object.fromEntries(rows.map(r => [r.date, r]));

  const solarToday = byDate[today];
  const solarTomorrow = byDate[tomorrow];

  function buildEvent(
    name: string,
    timestamp: string,
    type: "solar" | "lunar"
  ): EphemerisEvent {
    const zoned = utcToZonedTime(timestamp, TZ);
    return {
      name,
      timestamp,
      timeLocal: format(zoned, "h:mm a"),
      date: format(zoned, "yyyy-MM-dd"),
      isTomorrow: format(zoned, "yyyy-MM-dd") === tomorrow,
      type
    };
  }

  const solar = {
    sunrise: buildEvent("Sunrise", solarToday.sunrise, "solar"),
    sunset: buildEvent("Sunset", solarToday.sunset, "solar")
  };

  const lunar = {
    moonrise: buildEvent("Moonrise", solarToday.moonrise, "lunar"),
    moonset: buildEvent("Moonset", solarToday.moonset, "lunar"),
    illumination: solarToday.illumination
  };

  // Determine next event
  const allEvents = [
    solar.sunrise,
    solar.sunset,
    lunar.moonrise,
    lunar.moonset
  ];

  const now = Date.now();

  const nextEvent = allEvents
    .filter(e => new Date(e.timestamp).getTime() > now)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];

  return {
    solar,
    lunar,
    nextEvent,
    fetchedAt: new Date().toISOString()
  };
}
