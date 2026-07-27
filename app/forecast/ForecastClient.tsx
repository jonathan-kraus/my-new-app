"use client";

import { useEffect, useRef, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import { ForecastCard } from "./ForecastCard";
import { CurrentWeather } from "./CurrentWeather";
import { useForecastTimeline } from "@/hooks/useForecastTimeline";
import type { Location } from "@/lib/types";

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
    queueMicrotask(() => {
      setIsReady(true);
    });
  }, []);

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
      queueMicrotask(() => {
        setSelectedId(locations[1]?.id ?? null);
      });
    }
  }, [locations, selectedId]);

  // Persist selection
  useEffect(() => {
    if (selectedId) {
      console.log("Persisting selected location ID:", selectedId);
      localStorage.setItem("lastLocationId", selectedId);
    }
  }, [selectedId]);
 console.log("EOE selected location ID:", selectedId);
  // Fetch forecast when location changes
  useEffect(() => {
    if (!selectedId) return;
     console.log("After EOE selected location ID:", selectedId);
    const requestId = ++latestForecastRequestRef.current;
    const controller = new AbortController();

    fetch(`/api/weather/forecast?locationId=${selectedId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((next: ForecastResponse) => {
        // Ignore stale responses from older requests.
        if (requestId !== latestForecastRequestRef.current) return;

        setForecast((prev) => {
          // In dev Strict Mode, duplicate mounts can issue near-simultaneous
          // requests. If the second response is from cache for the same
          // snapshot, keep the first API source so the badge is accurate to the
          // initial fetch that just happened.
          if (
            prev &&
            prev.source === "api" &&
            next.source === "cache" &&
            prev.fetchedAt === next.fetchedAt &&
            prev.location.id === next.location.id
          ) {
            void fetch("/api/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              keepalive: true,
              body: JSON.stringify({
                domain: "weather",
                level: "info",
                message:
                  "Forecast source guard kept api over cache duplicate response",
                file: "app/forecast/ForecastClient.tsx",
                line: 99,
                payload: {
                  locationId: next.location.id,
                  fetchedAt: next.fetchedAt,
                  previousSource: prev.source,
                  nextSource: next.source,
                },
                meta: {
                  built: {
                    route: "forecast-client",
                    requestId: crypto.randomUUID(),
                    eventIndex: ++logEventIndexRef.current,
                  },
                },
              }),
            }).catch((error: unknown) => {
              console.error("Failed to write forecast source guard log", error);
            });
            return prev;
          }
          return next;
        });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.error("Forecast fetch failed", err);
      });

    return () => controller.abort();
  }, [selectedId]);

  const timeline = useForecastTimeline(forecast?.forecast ?? null);

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
          </>
        )}
      </div>
    </div>
  );
}
