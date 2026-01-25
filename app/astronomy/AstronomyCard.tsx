"use client";

type AstronomyCardProps = {
  data: any | null;
};

export function AstronomyCard({ data }: AstronomyCardProps) {
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

  return (
    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
      <h2 className="text-lg font-semibold mb-2">Astronomy</h2>

      {/* Next Event */}
      {nextEvent ? (
        <div className="mb-4">
          <p className="font-medium">Next Event</p>
          <p className="text-sm text-gray-300">{nextEvent.name}</p>
          <p className="text-sm text-gray-300">
            {safeTime(nextEvent.timestamp)}
          </p>
        </div>
      ) : (
        <p>No upcoming events</p>
      )}

      {/* Solar */}
      <div className="mb-4">
        <p className="font-medium">Solar</p>
        <p className="text-sm text-gray-300">
          Sunrise: {safeTime(solar?.sunrise?.timestamp)}
        </p>
        <p className="text-sm text-gray-300">
          Sunset: {safeTime(solar?.sunset?.timestamp)}
        </p>
      </div>

      {/* Lunar */}
      <div className="mb-2">
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
