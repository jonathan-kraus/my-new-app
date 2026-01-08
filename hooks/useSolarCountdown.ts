"use client";

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

  let nextEventLabel;
  let nextCountdown;

  if (now < sunrise) {
    nextEventLabel = "Sunrise";
    nextCountdown = diff(sunrise);
  } else if (now < sunset) {
    nextEventLabel = "Sunset";
    nextCountdown = diff(sunset);
  } else {
    nextEventLabel = "Tomorrow's Sunrise";
    nextCountdown = { hours: 0, minutes: 0, seconds: 0 };
  }

  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const dayLengthHours = dayLengthMs / 1000 / 60 / 60;

  const isDaytime = now >= sunrise && now <= sunset;
  const elapsedMs = now.getTime() - sunrise.getTime();
  const progressPercent = isDaytime
    ? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
    : 0;

  return {
    now,
    sunrise,
    sunset,
    nextEventLabel,
    nextCountdown,
    dayLengthHours,
    progressPercent,
  };
}
