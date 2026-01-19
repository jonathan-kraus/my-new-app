"use client";
// lib/astronomy-ui.ts
import { msUntil, msSince, isNow, isFuture } from "@/lib/time";

export interface AstronomySnapshotDTO {
  date: string;
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  sunriseBlueStart: string;
  sunriseBlueEnd: string;
  sunriseGoldenStart: string;
  sunriseGoldenEnd: string;
  sunsetGoldenStart: string;
  sunsetGoldenEnd: string;
  sunsetBlueStart: string;
  sunsetBlueEnd: string;
}

export function buildAstronomyEvents(
  today: AstronomySnapshotDTO,
  tomorrow: AstronomySnapshotDTO | null,
) {
  const parse = (s: string | null) => (s ? new Date(s) : null);

  const events = [
    { label: "Sunrise", at: parse(today.sunrise) },
    { label: "Sunset", at: parse(today.sunset) },
    { label: "Sunrise Blue Hour Start", at: parse(today.sunriseBlueStart) },
    { label: "Sunrise Blue Hour End", at: parse(today.sunriseBlueEnd) },
    { label: "Sunrise Golden Hour Start", at: parse(today.sunriseGoldenStart) },
    { label: "Sunrise Golden Hour End", at: parse(today.sunriseGoldenEnd) },
    { label: "Sunset Golden Hour Start", at: parse(today.sunsetGoldenStart) },
    { label: "Sunset Golden Hour End", at: parse(today.sunsetGoldenEnd) },
    { label: "Sunset Blue Hour Start", at: parse(today.sunsetBlueStart) },
    { label: "Sunset Blue Hour End", at: parse(today.sunsetBlueEnd) },
  ];

  if (today.moonrise)
    events.push({ label: "Moonrise", at: parse(today.moonrise) });
  if (today.moonset)
    events.push({ label: "Moonset", at: parse(today.moonset) });

  if (tomorrow?.sunrise) {
    events.push({
      label: "Tomorrow's Sunrise",
      at: parse(tomorrow.sunrise),
    });
  }

  events.sort((a, b) => {
    const aTime = a.at ? a.at.getTime() : 0;
    const bTime = b.at ? b.at.getTime() : 0;
    return aTime - bTime;
  });
  const now = new Date();

  const futureEvents = events.filter((e) => e.at && isFuture(e.at));
  const pastEvents = events.filter((e) => e.at && !isFuture(e.at));

  const nextEvent = futureEvents[0] ?? null;
  const previousEvent = pastEvents[pastEvents.length - 1] ?? null;

  const currentEvent =
    events.find((e, i) => {
      const next = events[i + 1];
      return next?.at && e.at ? isNow(e.at, next.at) : false;
    }) ?? null;

  return {
    events,
    nextEvent,
    previousEvent,
    currentEvent,
    timeUntilNext: nextEvent?.at ? msUntil(nextEvent.at) : null,
    timeSincePrevious: previousEvent?.at ? msSince(previousEvent.at) : null,
  };
}
