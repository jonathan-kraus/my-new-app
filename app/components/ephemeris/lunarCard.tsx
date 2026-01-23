// app/components/ephemeris/LunarCard.tsx

"use client";

import { useLiveCountdown } from "@/app/hooks/useLiveCountdown";

export default function LunarCard({ snapshot }) {
  const countdown = useLiveCountdown(snapshot.nextEvent.timeAbsolute);

  return (
    <div className="p-6 rounded-xl bg-purple-600 text-white shadow-lg space-y-3">
      <h2 className="text-2xl font-semibold">Lunar</h2>

      <p>Moonrise: {snapshot.moonrise}</p>
      <p>Moonset: {snapshot.moonset}</p>
      <p>Illumination: {snapshot.illumination.toFixed(2)}%</p>

      <div className="mt-4 p-3 bg-purple-800 rounded-lg">
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
