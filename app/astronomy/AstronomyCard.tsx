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

  return (
    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
      <h2 className="text-lg font-semibold mb-2">Astronomy</h2>

      {nextEvent && (
        <div className="mb-4">
          <p className="font-medium">Next Event</p>
          <p className="text-sm text-gray-300">{nextEvent.name}</p>
          <p className="text-sm text-gray-300">
            {new Date(nextEvent.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="mb-4">
        <p className="font-medium">Solar</p>
        <p className="text-sm text-gray-300">
          Sunrise: {new Date(solar.sunrise.timestamp).toLocaleTimeString()}
        </p>
        <p className="text-sm text-gray-300">
          Sunset: {new Date(solar.sunset.timestamp).toLocaleTimeString()}
        </p>
      </div>

      <div className="mb-2">
        <p className="font-medium">Lunar</p>
        <p className="text-sm text-gray-300">
          Moonrise: {new Date(lunar.moonrise.timestamp).toLocaleTimeString()}
        </p>
        <p className="text-sm text-gray-300">
          Moonset: {new Date(lunar.moonset.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
