"use client";

import { useSolarTimeline } from "@/hooks/useSolarTimeline";
import ProgressBar from "@/components/ProgressBar";
export function SolarCard({
  sunrise,
  sunset,
  fetchedAt,
}: {
  sunrise: string;
  sunset: string;
  fetchedAt: string;
}) {
  const t = useSolarTimeline(sunrise, sunset);

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Solar Timeline</h2>

      <div className="space-y-2">
        <p>
          🌅 Sunrise:{" "}
          {t.sunrise.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p>
          🌇 Sunset:{" "}
          {t.sunset.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p>🕒 Day Length: {t.dayLengthHours.toFixed(2)} hours</p>
      </div>

      <div className="mt-4">
        <p className="font-semibold">
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
      <p className="text-sm opacity-80 mt-4">
        Updated {new Date(fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
