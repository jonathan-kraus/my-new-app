// lib/ephemeris/getLunarSnapshot.ts

import { db } from "@/lib/db";

export type LunarSnapshot = {
  date: string;
  moonrise: string | null;
  moonset: string | null;
  illumination: number;
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

  const now = new Date();
  const moonrise = snap.moonrise ? new Date(snap.moonrise) : null;
  const moonset = snap.moonset ? new Date(snap.moonset) : null;

  const events = [];
  if (moonrise) events.push({ name: "Moonrise", time: moonrise });
  if (moonset) events.push({ name: "Moonset", time: moonset });

  const upcoming = events.filter((e) => e.time > now);
  const next = upcoming.length > 0 ? upcoming[0] : events[0];

  const nextEvent = {
    name: next.name,
    time: next.time.toLocaleTimeString(),
    timeAbsolute: next.time.toISOString(),
    countdown: formatCountdown(next.time.getTime() - now.getTime()),
  };

  return {
    date: snap.date.toISOString().split("T")[0],
    moonrise: snap.moonrise,
    moonset: snap.moonset,
    illumination: snap.moonPhase ?? 0,
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
