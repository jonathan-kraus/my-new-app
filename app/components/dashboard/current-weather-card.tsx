'use client';

import { useEffect, useState } from "react";

export default function CurrentWeatherCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/weather?locationId=KOP`);
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-white shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data?.current) {
    return (
      <div className="p-6 rounded-xl border bg-white shadow-sm">
        <p className="text-gray-600">Unable to load weather data.</p>
      </div>
    );
  }

  const { current, sources } = data;

  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Current Weather</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            sources.current === "cache"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {sources.current.toUpperCase()}
        </span>
      </div>

      <div className="flex items-end gap-4">
        <div className="text-5xl font-bold">
          {Math.round(current.temperature)}°
        </div>
        <div className="text-gray-600">
          <div>Feels like {Math.round(current.feelsLike)}°</div>
          <div className="text-sm mt-1">
            Humidity: {current.humidity}%
          </div>
          <div className="text-sm">
            Wind: {current.windSpeed} mph
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Updated {new Date(current.fetchedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
