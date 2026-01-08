"use client";

import { useSolarCountdown } from "@/hooks/useSolarCountdown";
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
  // Convert strings → Date objects
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  // Use the new countdown hook
  const t = useSolarCountdown(sunriseDate, sunsetDate);

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Solar Timeline</h2>

      <div className="space-y-2">
        <p>
          🌅 Sunrise:{" "}
          {sunriseDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          })}
        </p>

        <p>
          🌇 Sunset:{" "}
          {sunsetDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          })}
        </p>

        <p>🕒 Day Length: {t.dayLengthHours.toFixed(2)} hours</p>
      </div>

      <div className="mt-4">
        <p className="font-semibold">
          {t.nextEventLabel} in {t.nextCountdown.hours}h{" "}
          {t.nextCountdown.minutes}m {t.nextCountdown.seconds}s
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
        Updated{" "}
        {new Date(fetchedAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })}
      </p>
    </div>
  );
}
