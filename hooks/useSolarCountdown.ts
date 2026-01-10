export function useSolarCountdown(
  sunrise: Date | null,
  sunset: Date | null,
  nextSunrise: Date | null,
) {
  const now = new Date();

  console.group("🌞 useSolarCountdown");
  console.log("now:", now);
  console.log("sunrise:", sunrise);
  console.log("sunset:", sunset);
  console.log("nextSunrise:", nextSunrise);

  if (!sunrise || !sunset || !nextSunrise) {
    console.warn("Missing data → returning fallback");
    console.groupEnd();
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
    console.log("Branch: BEFORE sunrise");
    target = sunrise;
    nextEventLabel = "Sunrise";
  } else if (now >= sunrise && now < sunset) {
    console.log("Branch: BETWEEN sunrise and sunset");
    target = sunset;
    nextEventLabel = "Sunset";
  } else {
    console.log("Branch: AFTER sunset");
    target = nextSunrise;
    nextEventLabel = "Tomorrow’s Sunrise";
  }

  console.log("Selected target:", target);
  console.log("Event label:", nextEventLabel);

  const diffMs = target.getTime() - now.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const countdown = `${hours}h ${minutes}m ${seconds}s`;
  console.log("Countdown:", countdown);

  const isDaytime = now >= sunrise && now <= sunset;
  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const elapsedMs = now.getTime() - sunrise.getTime();
  const progressPercent = isDaytime
    ? Math.min(100, Math.max(0, (elapsedMs / dayLengthMs) * 100))
    : 0;

  console.log("isDaytime:", isDaytime);
  console.log("dayLengthHours:", dayLengthMs / 1000 / 60 / 60);
  console.log("progressPercent:", progressPercent);
  console.groupEnd();

  return {
    nextEventLabel,
    countdown,
    progressPercent,
    dayLengthHours: dayLengthMs / 1000 / 60 / 60,
  };
}
