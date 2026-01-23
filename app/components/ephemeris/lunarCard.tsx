"use client";

import type { LunarSnapshot } from "@/lib/ephemeris/types";
import { useLiveCountdown } from "@/hooks/useLiveCountdown";

export default function LunarCard({ snapshot }: { snapshot: LunarSnapshot }) {
  const next =
    new Date(snapshot.moonrise.timestamp).getTime() > Date.now()
      ? snapshot.moonrise
      : snapshot.moonset;

  const countdown = useLiveCountdown(next.timestamp);

  return (
    <div className="p-6 rounded-xl bg-purple-600 text-white shadow-lg space-y-3">
      <h2 className="text-2xl font-semibold">Lunar</h2>

      <p>Moonrise: {snapshot.moonrise.timeLocal}</p>
      <p>Moonset: {snapshot.moonset.timeLocal}</p>
      <p>
        Illumination:{" "}
        {snapshot.illumination != null
          ? snapshot.illumination.toFixed(2)
          : "N/A"}
        %
      </p>

      <div className="mt-4 p-3 bg-purple-800 rounded-lg">
        <p className="font-semibold">{next.name}</p>
        <p>{next.timeLocal}</p>
        <p className="text-lg font-bold mt-1">{countdown}</p>
      </div>
    </div>
  );
}
