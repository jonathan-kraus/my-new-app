// lib/astronomy/countdown.ts

import { msUntil } from "@/lib/time";

export function nextEvent(events: Record<string, Date | null>) {
  const now = Date.now();
  let best: { name: string; time: Date } | null = null;

  for (const [name, time] of Object.entries(events)) {
    if (!time) continue;
    if (time.getTime() <= now) continue;

    if (!best || time.getTime() < best.time.getTime()) {
      best = { name, time };
    }
  }

  if (!best) return null;

  return {
    event: best.name,
    time: best.time,
    ms: msUntil(best.time),
  };
}
