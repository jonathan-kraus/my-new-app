// hooks/useAstronomy.ts
"use client";

import { useMemo } from "react";
import { addDays } from "date-fns";
import { parseLocalSolar } from "@/lib/solar/parseLocalSolar";
import {
  SolarTimes,
  LunarTimes,
  AstronomyHookResult,
} from "@/types/AstronomyTypes";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useAstronomy(snapshots: any[]): AstronomyHookResult {
  const now = new Date();

  return useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return { today: null, tomorrow: null, solar: null, lunar: null };
    }

    const normalized = snapshots.map((s) => ({
      ...s,
      dateObj: new Date(s.date),
    }));

    normalized.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const today = normalized.find((s) => isSameDay(s.dateObj, now));
    const tomorrow = normalized.find((s) =>
      isSameDay(s.dateObj, addDays(now, 1)),
    );

    if (!today) {
      return { today: null, tomorrow: null, solar: null, lunar: null };
    }

    const solar: SolarTimes = {
      sunrise: parseLocalSolar(today.sunrise),
      sunset: parseLocalSolar(today.sunset),
      nextSunrise: tomorrow ? parseLocalSolar(tomorrow.sunrise) : null,

      sunriseBlueStart: today.sunriseBlueStart
        ? parseLocalSolar(today.sunriseBlueStart)
        : null,
      sunriseBlueEnd: today.sunriseBlueEnd
        ? parseLocalSolar(today.sunriseBlueEnd)
        : null,
      sunriseGoldenStart: today.sunriseGoldenStart
        ? parseLocalSolar(today.sunriseGoldenStart)
        : null,
      sunriseGoldenEnd: today.sunriseGoldenEnd
        ? parseLocalSolar(today.sunriseGoldenEnd)
        : null,

      sunsetBlueStart: today.sunsetBlueStart
        ? parseLocalSolar(today.sunsetBlueStart)
        : null,
      sunsetBlueEnd: today.sunsetBlueEnd
        ? parseLocalSolar(today.sunsetBlueEnd)
        : null,
      sunsetGoldenStart: today.sunsetGoldenStart
        ? parseLocalSolar(today.sunsetGoldenStart)
        : null,
      sunsetGoldenEnd: today.sunsetGoldenEnd
        ? parseLocalSolar(today.sunsetGoldenEnd)
        : null,

      fetchedAt: new Date(today.fetchedAt),
    };

    const lunar: LunarTimes = {
      moonrise: today.moonrise ? parseLocalSolar(today.moonrise) : null,
      moonset: today.moonset ? parseLocalSolar(today.moonset) : null,

      nextMoonrise:
        tomorrow?.moonrise && tomorrow.moonrise !== ""
          ? parseLocalSolar(tomorrow.moonrise)
          : null,
      nextMoonset:
        tomorrow?.moonset && tomorrow.moonset !== ""
          ? parseLocalSolar(tomorrow.moonset)
          : null,

      moonPhase: today.moonPhase,
      fetchedAt: new Date(today.fetchedAt),
    };

    return { today, tomorrow, solar, lunar };
  }, [snapshots]);
}
