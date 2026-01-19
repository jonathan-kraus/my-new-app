// hooks/useSolarTimeline.ts

import { isPast, msUntil } from "@/lib/time";

export function useSolarTimeline(
  today: { sunrise: Date | null; sunset: Date | null },
  tomorrow: { sunrise: Date | null } | null,
) {
  const sunrise = today.sunrise;
  const sunset = today.sunset;
  const tomorrowSunrise = tomorrow?.sunrise ?? null;

  // If sunrise or sunset is missing, bail out safely
  if (!sunrise || !sunset) {
    return {
      nextEvent: null,
      nextTime: null,
      ms: 0,
    };
  }

  let nextEvent: "sunrise" | "sunset" | "tomorrowSunrise";
  let nextTime: Date;

  if (isPast(sunrise) && !isPast(sunset)) {
    nextEvent = "sunset";
    nextTime = sunset;
  } else if (isPast(sunset)) {
    // If tomorrow sunrise is missing, bail safely
    if (!tomorrowSunrise) {
      return {
        nextEvent: null,
        nextTime: null,
        ms: 0,
      };
    }
    nextEvent = "tomorrowSunrise";
    nextTime = tomorrowSunrise;
  } else {
    nextEvent = "sunrise";
    nextTime = sunrise;
  }

  return {
    nextEvent,
    nextTime,
    ms: msUntil(nextTime),
  };
}
