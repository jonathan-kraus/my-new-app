import { useNow } from "@/hooks/useNow";
import { useMemo } from "react";

export function useSolarCountdown(sunriseStr: string, sunsetStr: string) {
  const now = useNow();

  return useMemo(() => {
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);

    const sunriseDateStr = sunriseStr.slice(0, 10); // "YYYY-MM-DD"
    const nowDateStr = now.toISOString().slice(0, 10);

    const isToday = sunriseDateStr === nowDateStr;
    const isTomorrow = sunriseDateStr > nowDateStr;

    let target: Date | null = null;
    let label = "Sunrise";

    if (isToday) {
      // Today’s sunrise
      if (now < sunrise) {
        target = sunrise;
      } else {
        // Sunrise already passed → next sunrise is tomorrow
        target = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
        label = "Tomorrow's Sunrise";
      }
    } else if (isTomorrow) {
      // Tomorrow’s sunrise
      target = sunrise;
      label = "Tomorrow's Sunrise";
    } else {
      // Snapshot is stale → fallback
      return {
        label: "Sunrise",
        countdown: "—",
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const diffMs = target.getTime() - now.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    // Never allow > 24h unless explicitly tomorrow
    const safeHours = Math.min(hours, isTomorrow ? 24 : 23);

    return {
      label,
      countdown: `${safeHours}h ${minutes}m ${seconds}s`,
      hours: safeHours,
      minutes,
      seconds,
    };
  }, [now, sunriseStr, sunsetStr]);
}
