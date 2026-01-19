import { useMemo } from "react";
import { NormalizedAstronomySnapshot } from "@/lib/astronomy/types";

export interface AstronomyEvent {
  type: "solar" | "lunar";
  label: string;
  time: Date;
  ms: number;
}
function hasValidTime(e: {
  type: "solar" | "lunar";
  label: string;
  time: Date | null;
}): e is { type: "solar" | "lunar"; label: string; time: Date } {
  return e.time instanceof Date;
}

export interface AstronomyEvent {
  type: "solar" | "lunar";
  label: string;
  time: Date; // <-- NOT nullable
  ms: number;
}
interface CountdownResult {
  allEvents: AstronomyEvent[];
  nextEvent: AstronomyEvent | null;
}
export function useUnifiedAstronomyCountdown(
  today: NormalizedAstronomySnapshot | null,
  tomorrow: NormalizedAstronomySnapshot | null,
): CountdownResult {
  const { allEvents, nextEvent } = useMemo(() => {
    if (!today || !tomorrow) {
      return { allEvents: [], nextEvent: null };
    }

    const now = new Date();

    const raw: { type: "solar" | "lunar"; label: string; time: Date | null }[] =
      [
        { type: "solar", label: "Sunrise", time: today.sunriseDate },
        { type: "solar", label: "Sunset", time: today.sunsetDate },
        {
          type: "solar",
          label: "Tomorrow’s Sunrise",
          time: tomorrow.sunriseDate,
        },
        { type: "lunar", label: "Moonrise", time: today.moonriseDate },
        { type: "lunar", label: "Moonset", time: today.moonsetDate },
        {
          type: "lunar",
          label: "Tomorrow’s Moonrise",
          time: tomorrow.moonriseDate,
        },
      ];

    const allEvents = raw
      .filter(hasValidTime)
      .map((e) => ({ ...e, ms: e.time.getTime() - now.getTime() }))
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    const nextEvent = allEvents.find((e) => e.time > now) ?? null;

    return { allEvents, nextEvent };
  }, [today, tomorrow]);

  return { allEvents, nextEvent };
}
