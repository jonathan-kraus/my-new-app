"use client";

import { useEffect, useState } from "react";
import { selectSolarDay } from "@/lib/solar/selectSolarDay";
import { parseLocalSolar } from "@/lib/solar/parseLocalSolar";
import { logit } from "@/lib/log/client";

export function useSolarTimeline(
  days: { date: string; sunrise: string; sunset: string; nextSunrise?: string }[],
) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const selected = selectSolarDay(days);
  if (!selected) {
    return {
      sunrise: null,
      sunset: null,
      nextEventLabel: "No data",
      countdown: "0h 0m 0s",
      progressPercent: 0,
      dayLengthHours: 0,
    };
  }

  // Parse into Date objects safely
  const sunrise = parseLocalSolar(selected.sunrise);
  const sunset = parseLocalSolar(selected.sunset);
  const nextSunrise = selected.nextSunrise
    ? parseLocalSolar(selected.nextSunrise)
    : null;

  // If parsing failed, bail out safely
  if (!sunrise || !sunset) {
    return {
      sunrise: null,
      sunset: null,
      nextEventLabel: "Invalid data",
      countdown: "0h 0m 0s",
      progressPercent: 0,
      dayLengthHours: 0,
    };
  }

  logit({
    level: "debug",
    message: "useSolarTimeline",
    file: "hooks/useSolarTimeline.ts",
    line: 29,
    page: "useSolarTimeline",
    data: { sunrise, sunset, nextSunrise, now },
  });

  // Determine next event
  let target: Date;
  let nextEventLabel: string;

  if (now < sunrise) {
    target = sunrise;
    nextEventLabel = "Sunrise";
  } else if (now >= sunrise && now < sunset) {
    target = sunset;
    nextEventLabel = "Sunset";
  } else {
    target = nextSunrise!;
    nextEventLabel = "Tomorrow’s Sunrise";
  }

  // Countdown math
  const diffMs = target.getTime() - now.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const countdown = `${hours}h ${minutes}m ${seconds}s`;

  // Progress bar
  const isDaytime = now >= sunrise && now <= sunset;
  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const elapsedMs = now.getTime() - sunrise.getTime();
  const progressPercent = isDaytime
    ? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
    : 0;

  return {
    now,
    sunrise,
    sunset,
    nextEventLabel,
    countdown,
    progressPercent,
    dayLengthHours: dayLengthMs / 1000 / 60 / 60,
  };
}
