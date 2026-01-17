// hooks\useUnifiedAstronomyCountdown.ts  Creation Date: 2026-01-17 13:39:34

import { SolarDay, LunarDay } from "@/lib/astronomy/types";

export function useUnifiedAstronomyCountdown(
  solarToday: SolarDay,
  solarTomorrow: SolarDay,
  lunarToday: LunarDay,
  lunarTomorrow: LunarDay
) {
  const now = new Date();

  const events = [
    {
      type: "solar",
      label: "Sunrise",
      time: solarToday.sunrise ? new Date(solarToday.sunrise) : null,
    },
    {
      type: "solar",
      label: "Sunset",
      time: solarToday.sunset ? new Date(solarToday.sunset) : null,
    },
    {
      type: "solar",
      label: "Tomorrow’s Sunrise",
      time: solarTomorrow.sunrise ? new Date(solarTomorrow.sunrise) : null,
    },
    {
      type: "lunar",
      label: "Moonrise",
      time: lunarToday.moonrise ? new Date(lunarToday.moonrise) : null,
    },
    {
      type: "lunar",
      label: "Moonset",
      time: lunarToday.moonset ? new Date(lunarToday.moonset) : null,
    },
    {
      type: "lunar",
      label: "Tomorrow’s Moonrise",
      time: lunarTomorrow.moonrise ? new Date(lunarTomorrow.moonrise) : null,
    },
  ];

  const upcoming = events
    .filter((e): e is { type: string; label: string; time: Date } => {
      return e.time !== null && e.time > now;
    })
    .map(e => ({
      ...e,
      ms: e.time.getTime() - now.getTime(),
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  return upcoming[0] ?? null;
}



