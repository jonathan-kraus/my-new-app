"use client";

import { useMemo } from "react";
import { useNow } from "@/hooks/useNow";

// Interpret an ISO string as LOCAL time instead of UTC
function toLocalDate(iso: string) {
  const d = new Date(iso);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  );
}

export function useSolarTimeline(sunriseStr: string, sunsetStr: string) {
  const now = useNow();

  return useMemo(() => {
    // Convert API ISO → local Date
    const sunrise = toLocalDate(sunriseStr);
    const sunset = toLocalDate(sunsetStr);

    const dayLengthMs = sunset.getTime() - sunrise.getTime();
    const dayLengthHours = dayLengthMs / 1000 / 60 / 60;

    const isDaytime = now >= sunrise && now <= sunset;

    let nextEventLabel = "";
    let nextEventTime: Date;

    if (now < sunrise) {
      nextEventLabel = "Sunrise";
      nextEventTime = sunrise;
    } else if (now < sunset) {
      nextEventLabel = "Sunset";
      nextEventTime = sunset;
    } else {
      nextEventLabel = "Tomorrow's Sunrise";
      nextEventTime = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffMs = nextEventTime.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.floor(diffMs / 1000 / 60));
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    const countdown = `${hours}h ${minutes}m`;

    let progressPercent = 0;
    if (isDaytime) {
      const elapsed = now.getTime() - sunrise.getTime();
      progressPercent = Math.min(
        100,
        Math.max(0, (elapsed / dayLengthMs) * 100)
      );
    }

    return {
      now,
      sunrise,
      sunset,
      dayLengthHours,
      isDaytime,
      nextEventLabel,
      countdown,
      progressPercent,
    };
  }, [now, sunriseStr, sunsetStr]);
}
