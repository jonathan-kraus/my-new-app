"use client";

import React from "react";

export function ForecastCard({
  location,
  current,
  forecast,
  fetchedAt,
  source,
  astronomy,
  sendForecastEmailAction,
}: {
  location: { name: string };
  current: { temperature: number; windspeed: number; humidity?: number };
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
  fetchedAt: string;
  source: string;
  astronomy?: {
    sunrise?: string;
    sunset?: string;
    moonrise?: string;
    moonset?: string;
    moonPhaseName?: string;
    moonPhaseEmoji?: string;
  };
  sendForecastEmailAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="bg-white text-black p-6 rounded-xl shadow relative">
      {/* ⭐ Email Button (Top‑Right) */}
      <form action={sendForecastEmailAction} className="absolute top-4 right-4">
        {/* Hidden fields with real forecast data */}
        <input type="hidden" name="locationName" value={location.name} />
        <input type="hidden" name="temperature" value={current.temperature} />
        <input type="hidden" name="feelsLike" value={current.temperature} />
        <input type="hidden" name="humidity" value={current.humidity ?? 0} />
        <input type="hidden" name="windSpeed" value={current.windspeed} />
        <input type="hidden" name="fetchedAt" value={fetchedAt} />
        <input type="hidden" name="source" value={source} />

        <input
          type="hidden"
          name="sunrise"
          value={astronomy?.sunrise || "N/A"}
        />
        <input type="hidden" name="sunset" value={astronomy?.sunset || "N/A"} />
        <input
          type="hidden"
          name="moonrise"
          value={astronomy?.moonrise || "N/A"}
        />
        <input
          type="hidden"
          name="moonset"
          value={astronomy?.moonset || "N/A"}
        />
        <input
          type="hidden"
          name="moonPhaseName"
          value={astronomy?.moonPhaseName || "Unknown"}
        />
        <input
          type="hidden"
          name="moonPhaseEmoji"
          value={astronomy?.moonPhaseEmoji || "🌑"}
        />

        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Email
        </button>
      </form>

      {/* ⭐ Card Header */}
      <h2 className="text-xl font-semibold mb-4">{location.name}</h2>

      {/* ⭐ Forecast List */}
      <div className="space-y-2">
        {forecast.time.map((t, i) => (
          <div key={t} className="flex justify-between border-b pb-2 text-sm">
            <span>
              {new Date(t).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {forecast.temperature_2m_max[i]}° /{" "}
              {forecast.temperature_2m_min[i]}°
            </span>
            <span>Code {forecast.weathercode[i]}</span>
          </div>
        ))}
      </div>

      {/* ⭐ Footer */}
      <div className="mt-4 text-xs text-gray-600">
        <p>Source: {source}</p>
        <p>Fetched: {new Date(fetchedAt).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
