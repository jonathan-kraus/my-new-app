"use client";

import { formatDistanceToNow } from "date-fns";

export function ForecastCard({
  location,
  current,
  forecast,
  fetchedAt,
  source,
}: {
  location: any;
  current: any;
  forecast: any;
  fetchedAt: string;
  source: string;
}) {
  const updatedAgo = formatDistanceToNow(new Date(fetchedAt), {
    addSuffix: true,
  });

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-500 text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">7‑Day Forecast</h2>

      {/* Current conditions */}
      <div className="mb-6">
        <p className="text-lg font-semibold">
          {location.name}: {current.temperature}°F
        </p>
        <p className="opacity-80">
          Wind: {current.windspeed} mph · Code {current.weathercode}
        </p>
      </div>

      {/* Forecast grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {forecast.time.map((day: string, i: number) => (
          <div
            key={day}
            className="bg-white/20 rounded-lg p-2 backdrop-blur-sm"
          >
            <p className="font-semibold">
              {new Date(day).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
            <p className="text-sm">
              {forecast.temperature_2m_max[i]}° /{" "}
              {forecast.temperature_2m_min[i]}°
            </p>
            <p className="text-xs opacity-80">
              Code {forecast.weathercode[i]}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-sm opacity-80 mt-4">
        Source: {source} · Updated {updatedAgo}
      </p>
    </div>
  );
}
