import { useNow } from "@/hooks/useNow";
import { useMemo } from "react";

export function useLunarTimeline(
  moonriseStr: string | null,
  moonsetStr: string | null,
  nextMoonriseStr: string | null
) {
  const now = useNow();

  return useMemo(() => {
    const moonrise = moonriseStr ? new Date(moonriseStr) : null;
    const moonset = moonsetStr ? new Date(moonsetStr) : null;
    const nextMoonrise = nextMoonriseStr ? new Date(nextMoonriseStr) : null;

    // Visibility hours
    let visibilityHours = 0;
    if (moonrise && moonset) {
      visibilityHours = Math.max(
        0,
        (moonset.getTime() - moonrise.getTime()) / 3600000
      );
    }

    // Progress percent
    let progressPercent = 0;
    if (moonrise && moonset) {
      if (now <= moonrise) progressPercent = 0;
      else if (now >= moonset) progressPercent = 100;
      else {
        const elapsed = now.getTime() - moonrise.getTime();
        const total = moonset.getTime() - moonrise.getTime();
        progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
    }

    const isVisible =
      moonrise && moonset ? now >= moonrise && now <= moonset : false;

    // Determine next event
    let nextEventLabel = "No upcoming lunar events";
    let nextEventTime = now;

    if (moonrise && now < moonrise) {
      nextEventLabel = "Moonrise";
      nextEventTime = moonrise;
    } else if (moonset && now < moonset) {
      nextEventLabel = "Moonset";
      nextEventTime = moonset;
    } else if (nextMoonrise) {
      nextEventLabel = "Next Moonrise";
      nextEventTime = nextMoonrise;
    } else if (moonrise) {
      nextEventLabel = "Tomorrow's Moonrise";
      nextEventTime = new Date(moonrise.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffMs = nextEventTime.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;

    return {
      moonrise,
      moonset,
      visibilityHours,
      progressPercent,
      isVisible,
      nextEventLabel,
      countdown: `${hours}h ${minutes}m`,
      hours,
      minutes,
    };
  }, [now, moonriseStr, moonsetStr, nextMoonriseStr]);
}
