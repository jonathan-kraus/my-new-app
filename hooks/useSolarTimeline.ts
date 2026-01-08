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

  const nextEvent =
    now < sunrise
      ? "sunrise"
      : now < sunset
      ? "sunset"
      : "none";

  const nextCountdown =
    nextEvent === "sunrise"
      ? sunriseCountdown
      : nextEvent === "sunset"
      ? sunsetCountdown
      : { hours: 0, minutes: 0, seconds: 0 };

  return {
    now,
    sunriseCountdown,
    sunsetCountdown,
    nextEvent,
    nextCountdown,
  };
}
