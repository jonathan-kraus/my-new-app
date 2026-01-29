"use client";

import { formatDistanceToNow } from "date-fns";
import { useForecastTimeline } from "@/hooks/useForecastTimeline";

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

  const t = useForecastTimeline(forecast);

  return (
    <div className="w-full max-w-5xl mx-auto p-8 rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-500 text-white shadow-lg">
      <h2 className="text-3xl font-bold mb-6">7‑Day Forecast</h2>

      {/* Current conditions */}
      <div className="mb-6">
        <p className="text-xl font-semibold">
          {location.name}: {current.temperature}°F
        </p>
        <p className="opacity-80 text-sm">
          Wind: {current.windspeed} mph · Code {current.weathercode}
        </p>
      </div>

      {/* Forecast grid */}
      <div className="grid grid-cols-7 gap-4 text-center">
        {forecast.time.map((day: string, i: number) => (
          <div
            key={day}
            className="bg-white/20 rounded-lg p-4 backdrop-blur-sm"
          >
            <p className="font-semibold text-lg">
              {new Date(day).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
            <p className="text-sm">
              {forecast.temperature_2m_max[i]}° /{" "}
              {forecast.temperature_2m_min[i]}°
            </p>
            <p className="text-xs opacity-80">Code {daily.weathercode[i]}</p>
            <p className="text-2xl mt-1">🌤️</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-sm opacity-70 mt-4">
        Source: {source} · Updated {updatedAgo}
      </p>
    </div>
  );
}
