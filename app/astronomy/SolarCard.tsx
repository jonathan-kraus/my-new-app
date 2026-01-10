// app/astronomy/SolarCard.tsx
"use client";

import { SolarTimes } from "@/types/AstronomyTypes";
import { useSolarCountdown } from "@/hooks/useSolarCountdown";
import ProgressBar from "@/components/ProgressBar";
import fmt from "@/components/activity/fmt";
export function SolarCard({
  sunrise,
  sunset,
  nextSunrise,
  fetchedAt,
}: SolarTimes) {
  const t = useSolarCountdown(sunrise, sunset, nextSunrise);

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 text-white shadow-lg space-y-4">
      <h2 className="text-2xl font-bold">Solar Timeline</h2>

      <div className="space-y-1 text-sm">
        <p>🌅 Sunrise: {fmt(sunrise)} </p>
        <p>🌇 Sunset:{fmt(sunset)} </p>
        <p>🕒 Day Length: {t.dayLengthHours.toFixed(2)} hours</p>
      </div>

      <div>
        <p className="font-semibold text-sm">
          {t.nextEventLabel} in {t.countdown}
        </p>
        <div className="w-full h-3 bg-white/30 rounded-full mt-2 overflow-hidden">
          <ProgressBar
            value={t.progressPercent}
            barClassName="bg-yellow-300"
            className="bg-yellow-900/30"
          />
        </div>
      </div>

      <p className="text-xs opacity-80">
        Updated{" "}
        {fetchedAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })}
      </p>
    </div>
  );
}
