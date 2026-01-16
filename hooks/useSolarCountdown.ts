"use client";

import { useEffect, useState } from "react";
export function useSolarCountdown(
  today: {
    sunrise: Date | null;
    sunset: Date | null;
  },
  tomorrow: {
    sunrise: Date | null;
  } | null,
) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // If we don't have sunrise/sunset, return a safe fallback
  if (!today.sunrise || !today.sunset) {
    return {
      now,
      sunrise: null,
      sunset: null,
      nextSunrise: tomorrow?.sunrise ?? null,
      nextEventLabel: "No solar data",
      nextCountdown: { hours: 0, minutes: 0, seconds: 0 },
      isDaytime: false,
      progressPercent: 0,
    };
  }

  const sunrise = today.sunrise;
  const sunset = today.sunset;
  const nextSunrise = tomorrow?.sunrise ?? null;

  const diff = (target: Date) => {
    const ms = target.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  let nextEventLabel = "";
  let nextCountdown = { hours: 0, minutes: 0, seconds: 0 };

  if (now < sunrise) {
    nextEventLabel = "Sunrise";
    nextCountdown = diff(sunrise);
  } else if (now < sunset) {
    nextEventLabel = "Sunset";
    nextCountdown = diff(sunset);
  } else {
    nextEventLabel = "Tomorrow's Sunrise";
    nextCountdown = nextSunrise ? diff(nextSunrise) : nextCountdown;
  }

  const isDaytime = now >= sunrise && now < sunset;

  let progressPercent = 0;
  if (isDaytime) {
    const total = sunset.getTime() - sunrise.getTime();
    const elapsed = now.getTime() - sunrise.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return {
    now,
    sunrise,
    sunset,
    nextSunrise,
    nextEventLabel,
    nextCountdown,
    isDaytime,
    progressPercent,
  };
}
