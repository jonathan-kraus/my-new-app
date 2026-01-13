"use client";

import { useSolarCountdown } from "@/hooks/useSolarCountdown";
import { useLunarCountdown } from "@/hooks/useLunarCountdown";

export function UnifiedNextAstronomicalEventCard({
  solarToday,
  solarTomorrow,
  lunarToday,
  lunarTomorrow,
}: any) {
  // Solar
  const solar = useSolarCountdown({
    today: solarToday,
    tomorrow: solarTomorrow,
  });

  // Lunar
  const lunar = useLunarCountdown({
    today: lunarToday,
    tomorrow: lunarTomorrow,
  });

  // Build comparable timestamps
  const solarTarget = (() => {
    if (solar.nextEventLabel === "Sunrise") return solar.sunrise;
    if (solar.nextEventLabel === "Sunset") return solar.sunset;
    if (solar.nextEventLabel === "Tomorrow's Sunrise") return solar.nextSunrise;
    return null;
  })();

  const lunarTarget = (() => {
    if (lunar.nextEventLabel === "Moonrise") return lunar.moonrise;
    if (lunar.nextEventLabel === "Moonset") return lunar.moonset;
    if (lunar.nextEventLabel === "Tomorrow's Moonrise")
      return lunar.nextMoonrise;
    return null;
  })();

  // Determine the unified next event
  let unifiedLabel = "";
  let unifiedCountdown = { hours: 0, minutes: 0, seconds: 0 };

  if (solarTarget && lunarTarget) {
    if (solarTarget < lunarTarget) {
      unifiedLabel = solar.nextEventLabel;
      unifiedCountdown = solar.nextCountdown;
    } else {
      unifiedLabel = lunar.nextEventLabel;
      unifiedCountdown = lunar.nextCountdown;
    }
  } else if (solarTarget) {
    unifiedLabel = solar.nextEventLabel;
    unifiedCountdown = solar.nextCountdown;
  } else if (lunarTarget) {
    unifiedLabel = lunar.nextEventLabel;
    unifiedCountdown = lunar.nextCountdown;
  } else {
    unifiedLabel = "No upcoming events";
  }

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold mb-2">Next Astronomical Event</h2>

      <div className="text-sm opacity-80 mb-1">
        <span className="font-medium">{unifiedLabel}</span>
      </div>

      <div className="text-2xl font-bold mb-3">
        {unifiedCountdown.hours}h {unifiedCountdown.minutes}m{" "}
        {unifiedCountdown.seconds}s
      </div>

      <div className="text-xs opacity-60">Solar: {solar.nextEventLabel}</div>
      <div className="text-xs opacity-60">Lunar: {lunar.nextEventLabel}</div>
    </div>
  );
}
