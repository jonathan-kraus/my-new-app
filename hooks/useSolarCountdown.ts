export function useSolarCountdown(
  sunrise: Date | null,
  sunset: Date | null,
  nextSunrise: Date | null,
) {
  const now = new Date();

  if (!sunrise || !sunset || !nextSunrise) {
    return {
      nextEventLabel: "No data",
      countdown: "0h 0m 0s",
      progressPercent: 0,
      dayLengthHours: 0,
    };
  }

  let target: Date;
  let nextEventLabel: string;

  if (now < sunrise) {
    target = sunrise;
    nextEventLabel = "Sunrise";
  } else if (now >= sunrise && now < sunset) {
    target = sunset;
    nextEventLabel = "Sunset";
  } else {
    target = nextSunrise;
    nextEventLabel = "Tomorrow’s Sunrise";
  }

  const diffMs = target.getTime() - now.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const countdown = `${hours}h ${minutes}m ${seconds}s`;

  const isDaytime = now >= sunrise && now <= sunset;
  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const elapsedMs = now.getTime() - sunrise.getTime();
  const progressPercent = isDaytime
    ? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
    : 0;

  return {
    nextEventLabel,
    countdown,
    progressPercent,
    dayLengthHours: dayLengthMs / 1000 / 60 / 60,
  };
}
