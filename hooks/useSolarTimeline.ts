import { useNow } from "@/hooks/useNow";
import { useMemo } from "react";

export function useSolarTimeline(sunriseStr: string, sunsetStr: string) {
  const now = useNow();

  return useMemo(() => {
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);

    // Compute day length
    const diffMs = sunset.getTime() - sunrise.getTime();
    const dayLengthHours = Math.max(0, diffMs / 1000 / 60 / 60);

    // Is the sun above the horizon?
    const isDaytime = now >= sunrise && now <= sunset;

    // Determine next event
    let nextEventLabel: string;
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

    // Countdown
    const diffToNextMs = nextEventTime.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.floor(diffToNextMs / 1000 / 60));
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;

    // Progress percent (sunrise → sunset)
    let progressPercent = 0;
    if (now <= sunrise) {
      progressPercent = 0;
    } else if (now >= sunset) {
      progressPercent = 100;
    } else {
      const elapsed = now.getTime() - sunrise.getTime();
      const total = sunset.getTime() - sunrise.getTime();
      progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    return {
      sunrise,
      sunset,
      isDaytime,
      dayLengthHours,
      progressPercent,
      nextEventLabel,
      countdown: `${hours}h ${minutes}m`,
    };
  }, [now, sunriseStr, sunsetStr]);
}
