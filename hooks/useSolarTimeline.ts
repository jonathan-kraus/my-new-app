"use client";

import { SolarTimes } from "@/types/AstronomyTypes";
import { useSolarCountdown } from "./useSolarCountdown";

export function useSolarTimeline({
  today,
  tomorrow,
}: {
  today: SolarTimes;
  tomorrow: SolarTimes | null;
}) {
  return useSolarCountdown({
    today: {
      correctedSunrise: today.correctedSunrise,
      sunset: today.sunset,
    },
    tomorrow: tomorrow
      ? { correctedSunrise: tomorrow.correctedSunrise }
      : null,
  });
}
