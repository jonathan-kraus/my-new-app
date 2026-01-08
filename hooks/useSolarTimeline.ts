"use client";

import { useEffect, useState } from "react";
import { selectSolarDay } from "@/lib/solar/selectSolarDay";
import { logit } from "@/lib/log/client";
export function useSolarTimeline(
  days: { date: string; sunrise: string; sunset: string }[],
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
      countdown: "0h 0m",
      progressPercent: 0,
      dayLengthHours: 0,
    };
  }

  const { sunrise, sunset, next } = selected;
  logit({
    level: "debug",
    message: "useSolarTimeline",
    file: "hooks/useSolarTimeline.ts",
    line: 29,
    page: "useSolarTimeline",
    data: { sunrise: sunrise, sunset: sunset, now: now },
  });
  // Countdown
  const target = next === "sunrise" ? sunrise : sunset;
  const diffMs = target.getTime() - now.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 1000 / 60));
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  const seconds = Math.floor((diffMs / 1000) % 60);

  const countdown = `${hours}h ${minutes}m ${seconds}s`;

  // Progress
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
    nextEventLabel: next === "sunrise" ? "Sunrise" : "Sunset",
    countdown,
    progressPercent,
    dayLengthHours: dayLengthMs / 1000 / 60 / 60,
  };
}
