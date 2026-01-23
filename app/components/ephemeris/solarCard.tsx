"use client";

import { SolarSnapshot } from "@/lib/ephemeris/getSolarSnapshot";

export type SolarCardProps = {
  snapshot: SolarSnapshot;
};

export default function SolarCard({ snapshot }: SolarCardProps) {
  return (
    <div className="bg-blue-900 text-white p-6 rounded-xl space-y-4 shadow-lg">
      <p>
        <strong>Sunrise:</strong> {snapshot.sunrise}
      </p>
      <p>
        <strong>Sunset:</strong> {snapshot.sunset}
      </p>
      <p>
        <strong>Daylight:</strong> {snapshot.daylightPercent}%
      </p>

      <div className="pt-2">
        <p className="font-semibold">Next Solar Event</p>
        <p>{snapshot.nextEvent.name}</p>
        <p>{snapshot.nextEvent.time}</p>
      </div>

      <p className="text-xs opacity-70">
        Updated {new Date(snapshot.fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
