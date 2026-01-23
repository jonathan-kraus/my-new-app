// lib/ephemeris/getLunarSnapshot.ts

import { db } from "@/lib/db";
export type LunarSnapshot = {
  date: string;
  moonrise: string | null;
  moonset: string | null;
  illumination: number;
  moonriseAbsolute: string | null;
  moonsetAbsolute: string | null;
  nextEvent: {
    name: string;
    time: string;
    timeAbsolute: string;
    countdown: string;
  };
  fetchedAt: string;
};

export async function getLunarSnapshot(
  locationId: string = "KOP",
): Promise<LunarSnapshot> {
  const snap = await db.astronomySnapshot.findFirst({
    where: { locationId },
    orderBy: { date: "desc" },
  });

  if (!snap) throw new Error("No astronomy snapshot found");

  return {
    date: snap.date.toISOString().split("T")[0],
    moonrise: snap.moonrise,
    moonset: snap.moonset,
    illumination: snap.moonPhase ?? 0,
    moonriseAbsolute: snap.moonriseAbsolute,
    moonsetAbsolute: snap.moonsetAbsolute,
    nextEvent: {
      name: snap.nextLunarEventName,
      time: snap.nextLunarEventTimeFormatted,
      timeAbsolute: snap.nextLunarEventTimeISO,
      countdown: snap.nextLunarEventCountdown,
    },
    fetchedAt: snap.fetchedAt.toISOString(),
  };
}
