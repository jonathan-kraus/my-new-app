"use client";

import { logit } from "@/lib/log/server";
import { useEffect, useState } from "react";

export function useSolarCountdown(sunrise: Date, sunset: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function diff(target: Date) {
    const ms = target.getTime() - now.getTime();
    if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);

    return { hours, minutes, seconds };
  }

  const sunriseCountdown = diff(sunrise);
  const sunsetCountdown = diff(sunset);
logit({
    level: "debug",
    message: "useSolarCountdown",
    file: "hooks/useSolarCountdown.ts",
    line: 27,
    page: "useSolarCountdown",
    data: {sunrise: sunrise, sunset: sunset, now: now, sunriseCountdown, sunsetCountdown},
  });
  const isDaytime = now >= sunrise && now <= sunset;

  const nextEventLabel =
    now < sunrise ? "Sunrise" : now < sunset ? "Sunset" : "Tomorrow's Sunrise";

  const nextCountdown =
    nextEventLabel === "Sunrise"
      ? sunriseCountdown
      : nextEventLabel === "Sunset"
        ? sunsetCountdown
        : sunriseCountdown; // tomorrow's sunrise

  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const elapsedMs = now.getTime() - sunrise.getTime();
  const progressPercent = isDaytime
    ? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
    : 0;

  return {
    now,
    sunrise,
    sunset,
    sunriseCountdown,
    sunsetCountdown,
    nextEventLabel,
    nextCountdown,
    dayLengthHours: dayLengthMs / 1000 / 60 / 60,
    progressPercent,
  };
}
