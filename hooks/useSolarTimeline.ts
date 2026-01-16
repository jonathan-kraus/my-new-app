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
      sunrise: today.sunrise,
      sunset: today.sunset,
    },
    tomorrow: tomorrow ? { sunrise: tomorrow.sunrise } : null,
  });
}
