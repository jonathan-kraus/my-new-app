"use client";

import {
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import type { Location } from "@/lib/types";

type WeatherPoint = {
  time: string;
  temperature?: number;
  temperatureApparent?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  precipitationProbability?: number;
  precipitationIntensity?: number;
  cloudCover?: number;
  weatherCode?: number;
};

type WeatherResponse = {
  location: Location;
  current: WeatherPoint;
  hourly: WeatherPoint[];
  fetchedAt: string;
  source: string;
};

const weatherDescriptions: Record<number, { label: string; icon: string }> = {
  1000: { label: "Clear", icon: "☀️" },
  1001: { label: "Cloudy", icon: "☁️" },
  1100: { label: "Mostly clear", icon: "🌤️" },
  1101: { label: "Partly cloudy", icon: "⛅" },
  1102: { label: "Mostly cloudy", icon: "🌥️" },
  2000: { label: "Fog", icon: "🌫️" },
  4000: { label: "Drizzle", icon: "🌦️" },
  4001: { label: "Rain", icon: "🌧️" },
  4200: { label: "Light rain", icon: "🌦️" },
  4201: { label: "Heavy rain", icon: "🌧️" },
  5000: { label: "Snow", icon: "🌨️" },
  5100: { label: "Light snow", icon: "🌨️" },
  5101: { label: "Heavy snow", icon: "❄️" },
  8000: { label: "Thunderstorm", icon: "⛈️" },
};

function weatherDescription(code?: number) {
  return weatherDescriptions[code ?? -1] ?? { label: "Conditions", icon: "🌡️" };
}

function rounded(value?: number) {
  return value == null ? "--" : Math.round(value).toString();
}

function formatHour(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
  });
}

function formatUpdated(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WeatherClient({
  locations,
}: {
  locations: Location[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return locations[0]?.id ?? null;
    return localStorage.getItem("lastLocationId") ?? locations[0]?.id ?? null;
  });
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (selectedId) localStorage.setItem("lastLocationId", selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setError(null);
    });

    fetch(`/api/weather/detail?locationId=${selectedId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as WeatherResponse & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(payload.error ?? "Weather unavailable");
        return payload;
      })
      .then(setWeather)
      .catch((reason: unknown) => {
        if ((reason as { name?: string }).name !== "AbortError") {
          setError(
            reason instanceof Error ? reason.message : "Weather unavailable",
          );
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [refreshKey, selectedId]);

  const condition = weatherDescription(weather?.current.weatherCode);
  const current = weather?.current;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#164e63_0%,#082f49_38%,#020617_100%)] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Live conditions
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Weather
            </h1>
            <p className="mt-2 text-slate-300">
              Hourly outlook from Tomorrow.io
            </p>
          </div>
          {selectedId && (
            <LocationSelector
              locations={locations}
              selectedId={selectedId}
              onChange={setSelectedId}
            />
          )}
        </header>

        {loading && !weather ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-slate-300">
            Loading conditions...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-300/30 bg-rose-950/40 p-6 text-rose-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : weather && current ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-3xl border border-cyan-200/20 bg-cyan-950/45 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg text-cyan-100">
                      {weather.location.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {condition.label}
                    </p>
                  </div>
                  <span className="text-5xl" aria-label={condition.label}>
                    {condition.icon}
                  </span>
                </div>
                <div className="mt-8 flex items-end gap-3">
                  <span className="text-7xl font-black tracking-tighter">
                    {rounded(current.temperature)}°
                  </span>
                  <span className="mb-3 text-slate-300">
                    Feels like {rounded(current.temperatureApparent)}°
                  </span>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
                  <span>Updated {formatUpdated(weather.fetchedAt)}</span>
                  <span>{weather.source}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Metric
                  icon={<Droplets size={18} />}
                  label="Humidity"
                  value={`${rounded(current.humidity)}%`}
                />
                <Metric
                  icon={<Wind size={18} />}
                  label="Wind"
                  value={`${rounded(current.windSpeed)} mph`}
                />
                <Metric
                  icon={<Gauge size={18} />}
                  label="Wind direction"
                  value={`${rounded(current.windDirection)}°`}
                />
                <Metric
                  icon={<CloudSun size={18} />}
                  label="Cloud cover"
                  value={`${rounded(current.cloudCover)}%`}
                />
                <Metric
                  icon={<Eye size={18} />}
                  label="Rain chance"
                  value={`${rounded(current.precipitationProbability)}%`}
                />
                <Metric
                  icon={<Thermometer size={18} />}
                  label="Rain rate"
                  value={`${rounded(current.precipitationIntensity)} in/hr`}
                />
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Next 24 hours</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Temperature, precipitation, and sky conditions
                  </p>
                </div>
                <span className="text-xs uppercase tracking-widest text-cyan-300">
                  Hourly
                </span>
              </div>
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {weather.hourly.map((point) => {
                  const pointCondition = weatherDescription(point.weatherCode);
                  return (
                    <div
                      key={point.time}
                      className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center"
                    >
                      <p className="text-xs text-slate-400">
                        {formatHour(point.time)}
                      </p>
                      <p
                        className="my-3 text-2xl"
                        aria-label={pointCondition.label}
                      >
                        {pointCondition.icon}
                      </p>
                      <p className="text-xl font-bold">
                        {rounded(point.temperature)}°
                      </p>
                      <p className="mt-2 text-xs text-cyan-300">
                        {rounded(point.precipitationProbability)}% rain
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
      <div className="flex items-center gap-2 text-cyan-300">
        {icon}
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold">{value}</p>
    </div>
  );
}
