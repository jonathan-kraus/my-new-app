// hooks/useGoldenHourTimeline.ts
"use client";

import { useMemo } from "react";
import { useNow } from "./useNow";

export function useGoldenHourTimeline(periods: {
  sunriseBlueStart: string;
  sunriseBlueEnd: string;
  sunriseGoldenStart: string;
  sunriseGoldenEnd: string;
  sunsetGoldenStart: string;
  sunsetGoldenEnd: string;
  sunsetBlueStart: string;
  sunsetBlueEnd: string;
}) {
  const now = useNow();

  return useMemo(() => {
    const parse = (s: string) => new Date(s);

    const timeline = [
      {
        label: "Sunrise Blue Hour",
        start: parse(periods.sunriseBlueStart),
        end: parse(periods.sunriseBlueEnd),
      },
      {
        label: "Sunrise Golden Hour",
        start: parse(periods.sunriseGoldenStart),
        end: parse(periods.sunriseGoldenEnd),
      },
      {
        label: "Sunset Golden Hour",
        start: parse(periods.sunsetGoldenStart),
        end: parse(periods.sunsetGoldenEnd),
      },
      {
        label: "Sunset Blue Hour",
        start: parse(periods.sunsetBlueStart),
        end: parse(periods.sunsetBlueEnd),
      },
    ];

    // Determine active period
    let active = null as null | (typeof timeline)[number];
    for (const p of timeline) {
      if (now >= p.start && now <= p.end) {
        active = p;
        break;
      }
    }

    // Determine next upcoming period
    const future = timeline.filter((p) => p.start > now);
    const next = future.length > 0 ? future[0] : null;

    // Countdown
    let nextEventLabel = "";
    let nextEventTime: Date | null = null;

    if (active) {
      nextEventLabel = `${active.label} ends`;
      nextEventTime = active.end;
    } else if (next) {
      nextEventLabel = `${next.label} starts`;
      nextEventTime = next.start;
    }

    let countdown = "";
    let progressPercent = 0;

    if (nextEventTime) {
      const diffMs = nextEventTime.getTime() - now.getTime();
      const diffMin = Math.max(0, Math.floor(diffMs / 1000 / 60));
      const hours = Math.floor(diffMin / 60);
      const minutes = diffMin % 60;
      countdown = `${hours}h ${minutes}m`;
    }

    if (active) {
      const total = active.end.getTime() - active.start.getTime();
      const elapsed = now.getTime() - active.start.getTime();
      progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    return {
      now,
      active,
      next,
      nextEventLabel,
      countdown,
      progressPercent,
      timeline,
    };
  }, [now, periods]);
}
