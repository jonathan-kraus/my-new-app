"use client";
// app/forecast/page.tsx

import { ForecastCard } from "./ForecastCard";

export const dynamic = "force-dynamic";

const mockForecast = [
  { day: "Today", icon: "☀️", high: 72, low: 55, description: "Sunny" },
  { day: "Sat", icon: "⛅", high: 68, low: 52, description: "Partly Cloudy" },
  { day: "Sun", icon: "🌧️", high: 64, low: 50, description: "Light Rain" },
  { day: "Mon", icon: "🌤️", high: 66, low: 49, description: "Clearing" },
  { day: "Tue", icon: "❄️", high: 38, low: 28, description: "Snow Showers" },
];

export default function ForecastPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 drop-shadow">
          5‑Day Forecast
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {mockForecast.map((day) => (
            <ForecastCard key={day.day} {...day} />
          ))}
        </div>
      </div>
    </div>
  );
}
