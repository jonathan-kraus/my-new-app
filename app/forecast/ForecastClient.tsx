"use client";

import { useEffect, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { useForecastTimeline } from "@/hooks/useForecastTimeline";
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
    weathercode: number[];
  };
  fetchedAt: string;
  source: string;
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

  const timeline = forecast ? useForecastTimeline(forecast.forecast) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-4 sm:px-6 lg:px-8 py-10 text-white">
      <div className="w-full max-w-6xl mx-auto">
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
            <p className="mb-4 text-lg opacity-90">
              {forecast.location.name}
            </p>

            <CurrentWeather
              temperature={forecast.current.temperature}
              windspeed={forecast.current.windspeed}
            />

            <ForecastCard
              location={forecast.location}
              current={forecast.current}
              forecast={forecast.forecast}
              fetchedAt={forecast.fetchedAt}
              source={forecast.source}
            />

            {timeline && (
              <div className="mt-6 space-y-1 text-sm opacity-90">
                <p>
                  Warmest day:{" "}
                  {new Date(timeline.warmestDay).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  Coldest day:{" "}
                  {new Date(timeline.coldestDay).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>Trend: {timeline.trend}</p>
                <p>
                  Avg High: {timeline.avgHigh.toFixed(1)}° · Avg Low:{" "}
                  {timeline.avgLow.toFixed(1)}°
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
