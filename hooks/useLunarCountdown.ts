// hooks/useLunarCountdown.ts

import {
  msUntil,
  isPast,
  parseLocalTimestamp,
  parseLocalTimestampTomorrow,
} from "@/lib/time";

export function useLunarCountdown(today: any, tomorrow: any) {
  // Parse today's events as LOCAL times
  console.log("🌙 LUNAR DEBUG: 44");

  const moonriseDate = parseLocalTimestamp(today.moonrise);
  const moonsetDate = parseLocalTimestamp(today.moonset);
  const moonrise = today.moonrise ? parseLocalTimestamp(today.moonrise) : null;

  const moonset = today.moonset ? parseLocalTimestamp(today.moonset) : null;

  const nextMoonrise = tomorrow?.moonrise
    ? parseLocalTimestamp(tomorrow.moonrise)
    : null;

  console.log(moonriseDate, moonsetDate);
  // Parse tomorrow's moonrise as LOCAL and force it into tomorrow
  const tomorrowMoonrise = tomorrow?.moonrise
    ? parseLocalTimestampTomorrow(tomorrow.moonrise)
    : null;

  // Determine the next lunar event
  let nextEvent: "moonrise" | "moonset" | "tomorrowMoonrise" | null = null;
  let nextTime: Date | null = null;

  const now = Date.now();

  // Case 1: moonrise exists and is in the future → next event is moonrise
  if (moonrise && moonrise.getTime() > now) {
    nextEvent = "moonrise";
    nextTime = moonrise;
  }
  // Case 2: moonrise already happened but moonset is still ahead
  else if (moonset && moonset.getTime() > now) {
    nextEvent = "moonset";
    nextTime = moonset;
  }
  // Case 3: both moonrise and moonset have passed → tomorrow's moonrise
  else if (tomorrowMoonrise) {
    nextEvent = "tomorrowMoonrise";
    nextTime = tomorrowMoonrise;
  }

  const ms = nextTime ? msUntil(nextTime) : 0;

  return {
    nextEvent,
    nextTime,
    ms,
  };
}
