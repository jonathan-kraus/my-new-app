"use client";

import { useEffect, useRef, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { useForecastTimeline } from "@/hooks/useForecastTimeline";
import { Location } from "@/lib/types";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";

type ForecastResponse = {
  location: Location;
  current: {
    temperature: number;
    windspeed: number;
    humidity?: number;
  };
  astronomy?: {
    sunrise?: string;
    sunset?: string;
    moonrise?: string;
    moonset?: string;
    moonPhaseName?: string;
    moonPhaseEmoji?: string;
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

export default function ForecastClient({
  locations,
  sendForecastEmailAction,
}: {
  locations: Location[];
  sendForecastEmailAction: (formData: FormData) => void | Promise<void>;
}) {
  const built = staticUniversalContext("ForecastClient");
  let jei = 0;
  const [isReady, setIsReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("lastLocationId");
  });
  logj({
    domain: "forecast",
    level: "info",
    message: "Forecast client loaded",
    file: "app/forecast/ForecastClient.tsx",
    line: 51,
    payload: { selectedId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const latestForecastRequestRef = useRef(0);

  useEffect(() => setIsReady(true), []);

  // Default location
  useEffect(() => {
    if (!selectedId && locations.length > 0) {
      setSelectedId(locations[1]?.id ?? null);
    }
  }, [locations, selectedId]);

  // Persist selection
  useEffect(() => {
    if (selectedId) {
      localStorage.setItem("lastLocationId", selectedId);
    }
  }, [selectedId]);

  // Fetch forecast
  useEffect(() => {
    if (!selectedId) return;

    const requestId = ++latestForecastRequestRef.current;
    const controller = new AbortController();

    fetch(`/api/weather/forecast?locationId=${selectedId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((next: ForecastResponse) => {
        if (requestId !== latestForecastRequestRef.current) return;
        setForecast(next);
      })
      .catch((err) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.error("Forecast fetch failed", err);
      });
    logj({
      domain: "forecast",
      level: "info",
      message: "Forecast client completed",
      file: "app/forecast/ForecastClient.tsx",
      line: 99,
      payload: { selectedId },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return () => controller.abort();
  }, [selectedId]);

  const timeline = forecast ? useForecastTimeline(forecast.forecast) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 px-4 py-10 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Forecast UI */}
        {forecast && (
          <>
            <p className="mb-4 text-lg opacity-90">{forecast.location.name}</p>

            <CurrentWeather
              temperature={forecast.current.temperature}
              windspeed={forecast.current.windspeed}
            />

            {/* ⭐ ForecastCard now receives the server action + forecast data */}
            <ForecastCard
              location={forecast.location}
              current={forecast.current}
              forecast={forecast.forecast}
              fetchedAt={forecast.fetchedAt}
              source={forecast.source}
              astronomy={
                forecast.astronomy || {
                  sunrise: "N/A",
                  sunset: "N/A",
                  moonrise: "N/A",
                  moonset: "N/A",
                  moonPhaseName: "Unknown",
                  moonPhaseEmoji: "🌑",
                }
              }
              sendForecastEmailAction={sendForecastEmailAction}
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
