"use client";

import { useEffect, useRef, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { useForecastTimeline } from "@/hooks/useForecastTimeline";
import { Location } from "@/lib/types";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
import { sendForecastEmailAction } from "./page"; // ⭐ server action import

const built = await staticUniversalContext("dashboard");

type ForecastResponse = {
  location: Location;
  current: {
    temperature: number;
    windspeed: number;
    humidity?: number;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moonPhaseName: string;
    moonPhaseEmoji: string;
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

  let jei = 0;
  logj({
    domain: "forecast",
    level: "info",
    message: "ForecastClient loaded",
    file: "app/components/forecast/ForecastClient.tsx",
    line: 30,
    payload: { locations },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("lastLocationId");
  });

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const latestForecastRequestRef = useRef(0);
  const logEventIndexRef = useRef(0);

  // Fallback to second location if nothing saved
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

  // Fetch forecast when location changes
  useEffect(() => {
    if (!selectedId) return;
    const requestId = ++latestForecastRequestRef.current;
    const controller = new AbortController();

    logj({
      domain: "forecast",
      level: "info",
      message: "About to fetch forecast for location",
      file: "app/components/forecast/ForecastClient.tsx",
      line: 30,
      payload: { selectedId },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

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

    return () => controller.abort();
  }, [selectedId]);

  const timeline = forecast ? useForecastTimeline(forecast.forecast) : null;
  const loggedRef = useRef(false);

  if (!loggedRef.current) {
    loggedRef.current = true;

    logj({
      domain: "forecast",
      level: "info",
      message: "ForecastClient received data",
      file: "app/components/forecast/ForecastClient.tsx",
      line: 162,
      payload: { forecast },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  }

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
            <p className="mb-4 text-lg opacity-90">{forecast.location.name}</p>

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

            {/* ⭐ EMAIL FORM — now inside ForecastClient */}
            <form
              action={sendForecastEmailAction}
              className="mt-10 bg-white text-black p-6 rounded-xl shadow space-y-4"
            >
              <h2 className="text-xl font-semibold">Email This Forecast</h2>

              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="border px-3 py-2 rounded w-64"
              />

              {/* ⭐ Hidden fields with real forecast data */}
              <input
                type="hidden"
                name="locationName"
                value={forecast.location.name}
              />
              <input
                type="hidden"
                name="temperature"
                value={forecast.current.temperature}
              />
              <input
                type="hidden"
                name="feelsLike"
                value={forecast.current.temperature}
              />
              <input
                type="hidden"
                name="humidity"
                value={forecast.current.humidity ?? 0}
              />
              <input
                type="hidden"
                name="windSpeed"
                value={forecast.current.windspeed}
              />
              <input
                type="hidden"
                name="fetchedAt"
                value={forecast.fetchedAt}
              />
              <input type="hidden" name="source" value={forecast.source} />

              <input
                type="hidden"
                name="sunrise"
                value={forecast.astronomy.sunrise}
              />
              <input
                type="hidden"
                name="sunset"
                value={forecast.astronomy.sunset}
              />
              <input
                type="hidden"
                name="moonrise"
                value={forecast.astronomy.moonrise}
              />
              <input
                type="hidden"
                name="moonset"
                value={forecast.astronomy.moonset}
              />
              <input
                type="hidden"
                name="moonPhaseName"
                value={forecast.astronomy.moonPhaseName}
              />
              <input
                type="hidden"
                name="moonPhaseEmoji"
                value={forecast.astronomy.moonPhaseEmoji}
              />

              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📧 Email Me This Forecast
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
