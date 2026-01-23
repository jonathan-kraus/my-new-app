// lib/ephemeris/getSolarSnapshot.ts

import { db } from "@/lib/db";
export type SolarSnapshot = {
  date: string;
  sunrise: string;
  sunset: string;
  daylightPercent: number;
  nextEvent: {
    name: string;
    time: string;
    timeAbsolute: string;
    countdown: string;
  };
  fetchedAt: string;
};
export async function getSolarSnapshot(
  locationId: string = "KOP",
): Promise<SolarSnapshot> {
  const snap = await db.astronomySnapshot.findFirst({
    where: { locationId },
    orderBy: { date: "desc" },
  });

  if (!snap) throw new Error("No astronomy snapshot found");

  return {
    date: snap.date.toISOString().split("T")[0],
    sunrise: snap.sunrise,
    sunset: snap.sunset,
    daylightPercent: snap.daylightPercent ?? 0,
    nextEvent: {
      name: snap.nextSolarEventName,
      time: snap.nextSolarEventTimeFormatted,
      timeAbsolute: snap.nextSolarEventTimeISO,
      countdown: snap.nextSolarEventCountdown,
    },
    fetchedAt: snap.fetchedAt.toISOString(),
  };
}
