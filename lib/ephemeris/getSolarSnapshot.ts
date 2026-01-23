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

  const sunrise = new Date(snap.sunrise);
  const sunset = new Date(snap.sunset);
  const now = new Date();

  const daylightPercent =
    ((now.getTime() - sunrise.getTime()) /
      (sunset.getTime() - sunrise.getTime())) *
    100;

  const nextEvent =
    now < sunrise
      ? {
          name: "Sunrise",
          time: sunrise.toLocaleTimeString(),
          timeAbsolute: sunrise.toISOString(),
          countdown: formatCountdown(sunrise.getTime() - now.getTime()),
        }
      : {
          name: "Sunset",
          time: sunset.toLocaleTimeString(),
          timeAbsolute: sunset.toISOString(),
          countdown: formatCountdown(sunset.getTime() - now.getTime()),
        };

  return {
    date: snap.date.toISOString().split("T")[0],
    sunrise: snap.sunrise,
    sunset: snap.sunset,
    daylightPercent: Math.max(0, Math.min(100, daylightPercent)),
    nextEvent,
    fetchedAt: snap.fetchedAt.toISOString(),
  };
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Now";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}
