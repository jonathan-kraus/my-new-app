// lib/astronomy/nextAstronomicalEvent.ts

import { msUntil } from "@/lib/time";

export function getUnifiedNextEvent(solar: any, lunar: any) {
  const candidates = [];

  if (solar?.nextEvent && solar?.nextTime) {
    candidates.push({
      type: "solar",
      event: solar.nextEvent,
      time: solar.nextTime,
      ms: msUntil(solar.nextTime),
    });
  }

  if (lunar?.nextEvent && lunar?.nextTime) {
    candidates.push({
      type: "lunar",
      event: lunar.nextEvent,
      time: lunar.nextTime,
      ms: msUntil(lunar.nextTime),
    });
  }

  if (candidates.length === 0) return null;

  // Pick the earliest upcoming event
  candidates.sort((a, b) => a.time.getTime() - b.time.getTime());

  return candidates[0];
}
