"use client";

import { useNow } from "@/hooks/useNow";

type AstronomyCardProps = {
  data: any | null;
};

export function AstronomyCard({ data }: AstronomyCardProps) {
  const now = useNow();

  if (!data) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded">
        No astronomy data available
      </div>
    );
  }

  const { solar, lunar, nextEvent } = data;

  const safeTime = (ts: string | null | undefined) =>
    ts ? new Date(ts).toLocaleTimeString() : "—";

  const countdownTo = (ts: string | null | undefined) => {
    if (!ts) return "—";
    const target = new Date(ts).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return "—";

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
      <h2 className="text-lg font-semibold mb-2">Astronomy</h2>

      {/* Solar Section */}
      <div className="mb-4">
        <p className="font-medium">Solar</p>
        <p className="text-sm text-gray-300">
          Sunrise: {safeTime(solar?.sunrise?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Sunset: {safeTime(solar?.sunset?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Countdown since sunrise: {countdownTo(solar?.sunrise?.timestamp)}
        </p>
      </div>

      {/* Lunar Section */}
      <div className="mb-4">
        <p className="font-medium">Next Lunar Event</p>
        <p className="text-sm text-gray-300">
          {nextEvent?.name ?? "—"} at {safeTime(nextEvent?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Countdown: {countdownTo(nextEvent?.timestamp)}
        </p>
      </div>

      {/* Moonrise/Moonset */}
      <div>
        <p className="font-medium">Lunar</p>
        <p className="text-sm text-gray-300">
          Moonrise: {safeTime(lunar?.moonrise?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Moonset: {safeTime(lunar?.moonset?.timestamp)}
        </p>
      </div>
    </div>
  );
}
