"use client";

import { useEffect, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { Location } from "@/lib/types";

type ForecastResponse = {
  location: Location;
  current: {
    temperature: number;
    windspeed: number;
  };
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

function formatDayLabel(dateStr: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

export default function ForecastClient({
  locations,
}: {
  locations: Location[];
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("lastLocationId");
  });

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  // Fallback to second location if nothing saved
  useEffect(() => {
    if (!selectedId && locations.length > 0) {
      setSelectedId(locations[1].id);
    }
  }, [locations, selectedId]);

  // Persist selection
  useEffect(() => {
    if (selectedId) {
      localStorage.setItem("lastLocationId", selectedId);
    }
  }, [selectedId]);

  // Fetch forecast when location changes
  useEffect(() => {
    if (!selectedId) return;

    fetch(`/api/weather/forecast?locationId=${selectedId}`)
      .then((r) => r.json())
      .then(setForecast);
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-6 py-10">
      <div className="max-w-5xl mx-auto text-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black drop-shadow">Forecast</h1>

          {isReady && selectedId && (
            <LocationSelector
              locations={locations}
              selectedId={selectedId}
              onChange={setSelectedId}
            />
          )}
        </div>

        {forecast && (
          <>
            <p className="mb-4 text-lg opacity-90">{forecast.location.name}</p>

            <CurrentWeather
              temperature={forecast.current.temperature}
              windspeed={forecast.current.windspeed}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {forecast.forecast.temperature_2m_max.map((high, i) => (
                <ForecastCard
                  key={i}
                  day={formatDayLabel(forecast.forecast.time[i], i)}
                  icon="🌤️"
                  high={Math.round(high)}
                  low={Math.round(forecast.forecast.temperature_2m_min[i])}
                  description="Forecast"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
