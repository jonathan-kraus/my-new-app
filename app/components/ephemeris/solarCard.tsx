// app/components/ephemeris/solarCard.tsx

"use client";

import { useLiveCountdown } from "@/app/hooks/useLiveCountdown";

export default function SolarCard({ snapshot }) {
  const countdown = useLiveCountdown(snapshot.nextEvent.timeAbsolute);

  return (
    <div className="p-6 rounded-xl bg-blue-600 text-white shadow-lg space-y-3">
      <h2 className="text-2xl font-semibold">Solar</h2>

      <p>Sunrise: {snapshot.sunrise}</p>
      <p>Sunset: {snapshot.sunset}</p>
      <p>Daylight: {snapshot.daylightPercent.toFixed(1)}%</p>

      <div className="mt-4 p-3 bg-blue-800 rounded-lg">
        <p className="font-semibold">{snapshot.nextEvent.name}</p>
        <p>{snapshot.nextEvent.time}</p>
        <p className="text-lg font-bold mt-1">{countdown}</p>
      </div>

      <p className="text-xs opacity-70">
        Updated: {snapshot.fetchedAt}
      </p>
    </div>
  );
}
