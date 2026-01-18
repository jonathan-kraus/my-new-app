// hooks\useUnifiedAstronomyCountdown.ts
import { useMemo } from "react";
import { NormalizedAstronomySnapshot } from "@/lib/astronomy/types";

export interface AstronomyEvent {
  type: "solar" | "lunar";
  label: string;
  time: Date;
  ms: number;
}

export function useUnifiedAstronomyCountdown(
  today: NormalizedAstronomySnapshot | null,
  tomorrow: NormalizedAstronomySnapshot | null,
) {
  const nextEvent = useMemo(() => {
    if (!today || !tomorrow) return null;
    const now = new Date();
    console.log("COUNTDOWN INPUT:", { today, tomorrow });

    const events = [
      { type: "solar" as const, label: "Sunrise", time: today?.sunriseDate },
      { type: "solar" as const, label: "Sunset", time: today?.sunsetDate },
      {
        type: "solar" as const,
        label: "Tomorrow’s Sunrise",
        time: tomorrow?.sunriseDate,
      },
      { type: "lunar" as const, label: "Moonrise", time: today?.moonriseDate },
      { type: "lunar" as const, label: "Moonset", time: today?.moonsetDate },
      {
        type: "lunar" as const,
        label: "Tomorrow’s Moonrise",
        time: tomorrow?.moonriseDate,
      },
    ];
console.log("nextAstronomicalEvent INPUT:", events);

const upcoming = (events ?? [])
  .filter(
    (e): e is { type: "solar" | "lunar"; label: string; time: Date } =>
      e != null && e.time instanceof Date && e.time > now
  )
  .map((e) => ({
    ...e,
    ms: e.time.getTime() - now.getTime(),
  }))
  .sort((a, b) => a.time.getTime() - b.time.getTime());


return upcoming[0] ?? null;

  }, [today, tomorrow]);

  return nextEvent;
}
