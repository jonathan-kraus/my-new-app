"use client";

import { LunarSnapshot } from "@/lib/ephemeris/getLunarSnapshot";

export type LunarCardProps = {
  snapshot: LunarSnapshot;
};

export default function LunarCard({ snapshot }: LunarCardProps) {
  return (
    <div className="bg-purple-900 text-white p-6 rounded-xl space-y-4 shadow-lg">
      <h2 className="text-xl font-semibold">Lunar Overview</h2>

      <p>
        <strong>Moonrise:</strong> {snapshot.moonrise ?? "—"}
      </p>
      <p>
        <strong>Moonset:</strong> {snapshot.moonset ?? "—"}
      </p>
      <p>
        <strong>Illumination:</strong> {snapshot.illumination}%
      </p>

      <div className="pt-2">
        <p className="font-semibold">Next Lunar Event</p>
        <p>{snapshot.nextEvent.name}</p>
        <p>{snapshot.nextEvent.time}</p>
      </div>

      <p className="text-xs opacity-70">
        Updated {new Date(snapshot.fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
