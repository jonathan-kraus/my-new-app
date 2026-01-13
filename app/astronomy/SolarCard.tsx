"use client";

import { useSolarCountdown } from "@/hooks/useSolarCountdown";
import { SolarTimes } from "@/types/AstronomyTypes";

export function SolarCard({
  today,
  tomorrow,
}: {
  today: SolarTimes;
  tomorrow: SolarTimes | null;
}) {
  // Guard: if sunrise or sunset is missing, show fallback
  if (!today.correctedSunrise || !today.sunset) {
    return (
      <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
        <h2 className="text-lg font-semibold mb-2">Solar</h2>
        <p>No solar data available</p>
      </div>
    );
  }

  const t = useSolarCountdown({
    today: {
      correctedSunrise: today.correctedSunrise,
      sunset: today.sunset,
    },
    tomorrow: tomorrow
      ? {
          correctedSunrise: tomorrow.correctedSunrise ?? null,
        }
      : null,
  });

  const fmt = (d: Date | null) =>
    d
      ? d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur space-y-4">
      <h2 className="text-lg font-semibold">Solar</h2>

      <div>
        <p>Sunrise: {fmt(today.correctedSunrise)}</p>
        <p>Sunset: {fmt(today.sunset)}</p>
      </div>

      <div>
        <p className="font-semibold">{t.nextEventLabel} in:</p>
        <p>
          {t.nextCountdown.hours}h {t.nextCountdown.minutes}m{" "}
          {t.nextCountdown.seconds}s
        </p>
      </div>

      {t.isDaytime && (
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all"
            style={{ width: `${t.progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
