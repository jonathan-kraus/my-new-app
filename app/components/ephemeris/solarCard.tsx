"use client";

import type { SolarSnapshot } from "@/lib/ephemeris/types";
import { useLiveCountdown } from "@/hooks/useLiveCountdown";

export default function SolarCard({ snapshot }: { snapshot: SolarSnapshot }) {
  // Determine which solar event is next (sunrise or sunset)
  const next =
    new Date(snapshot.sunrise.timestamp).getTime() > Date.now()
      ? snapshot.sunrise
      : snapshot.sunset;

  const countdown = useLiveCountdown(next.dateObj);

  return (
    <div className="p-6 rounded-xl bg-blue-600 text-white shadow-lg space-y-3">
      <h2 className="text-2xl font-semibold">Solar</h2>

      <p>Sunrise: {snapshot.sunrise.timeLocal}</p>
      <p>Sunset: {snapshot.sunset.timeLocal}</p>

      <div className="mt-4 p-3 bg-blue-800 rounded-lg">
        <p className="font-semibold">{next.name}</p>
        <p>{next.timeLocal}</p>
        <p className="text-lg font-bold mt-1">{countdown}</p>
      </div>
    </div>
  );
}
