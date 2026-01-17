// hooks\useUnifiedAstronomyCountdown.ts  Creation Date: 2026-01-17 13:39:34
// hooks/useUnifiedAstronomyCountdown.ts
import { useMemo } from "react";

export function useUnifiedAstronomyCountdown(solarToday, solarTomorrow, lunarToday, lunarTomorrow) {
  const now = new Date();

  const events = useMemo(() => {
    const all = [
      {
        type: "solar",
        label: "Sunrise",
        time: solarToday?.sunrise ? new Date(solarToday.sunrise) : null,
      },
      {
        type: "solar",
        label: "Sunset",
        time: solarToday?.sunset ? new Date(solarToday.sunset) : null,
      },
      {
        type: "solar",
        label: "Tomorrow’s Sunrise",
        time: solarTomorrow?.sunrise ? new Date(solarTomorrow.sunrise) : null,
      },
      {
        type: "lunar",
        label: "Moonrise",
        time: lunarToday?.moonrise ? new Date(lunarToday.moonrise) : null,
      },
      {
        type: "lunar",
        label: "Moonset",
        time: lunarToday?.moonset ? new Date(lunarToday.moonset) : null,
      },
      {
        type: "lunar",
        label: "Tomorrow’s Moonrise",
        time: lunarTomorrow?.moonrise ? new Date(lunarTomorrow.moonrise) : null,
      },
    ];

    return all
      .filter(e => e.time && e.time > now)
      .map(e => ({
        ...e,
        ms: e.time.getTime() - now.getTime(),
      }))
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [solarToday, solarTomorrow, lunarToday, lunarTomorrow]);

  return events[0] ?? null;
}

