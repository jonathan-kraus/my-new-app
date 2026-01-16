"use client";

import { useMemo } from "react";
import { addDays } from "date-fns";
import { logit } from "@/lib/log/client";
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

    // Normalize snapshot dates
    const normalized = snapshots.map((s) => ({
      ...s,
      dateObj: new Date(
        s.date.getFullYear(),
        s.date.getMonth(),
        s.date.getDate(),
      ),
    }));

    normalized.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const today = normalized.find((s) => isSameDay(s.dateObj, now));
    const tomorrow = normalized.find((s) =>
      isSameDay(s.dateObj, addDays(now, 1)),
    );

    if (!today) {
      return { today: null, tomorrow: null, solar: null, lunar: null };
    }

    // -----------------------------
    // SOLAR
    // -----------------------------
    const solar: SolarTimes = {
      sunrise: today.sunrise,
      sunset: today.sunset,
      nextSunrise: tomorrow ? tomorrow.sunrise : null,
      nextSunset: tomorrow ? tomorrow.sunset : null,
      sunriseBlueStart: today.sunriseBlueStart,
      sunriseBlueEnd: today.sunriseBlueEnd,
      sunriseGoldenStart: today.sunriseGoldenStart,

      sunriseGoldenEnd: today.sunriseGoldenEnd,

      sunsetBlueStart: today.sunsetBlueStart,
      sunsetBlueEnd: today.sunsetBlueEnd,
      sunsetGoldenStart: today.sunsetGoldenStart,
      sunsetGoldenEnd: today.sunsetGoldenEnd,

      fetchedAt: new Date(today.fetchedAt),
    };

    logit({
      level: "info",
      message: "useAstronomy solar parsed",
      file: "hooks/useAstronomy.ts",

      page: "Astronomy",
      data: { sunrise: today.sunrise, solar: solar },
    });

    // -----------------------------
    // LUNAR
    // -----------------------------
    const lunar: LunarTimes = {
      moonrise: today.moonrise,
      moonset: today.moonset,

      nextMoonrise: tomorrow?.moonrise && tomorrow.moonrise,
      nextMoonset: tomorrow?.moonset && tomorrow.moonset,

      moonPhase: today.moonPhase,
      fetchedAt: new Date(today.fetchedAt),
    };

    return { today, tomorrow, solar, lunar };
  }, [snapshots]);
}
