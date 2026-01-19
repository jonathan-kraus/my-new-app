"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { logit } from "@/lib/log/logit";
import { parseLocalTimestamp } from "@/lib/time";
type CurrentWeatherCardProps = {
  location: {
    id: string;
    key: string;
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};
const ctx = {
  requestId: crypto.randomUUID(),
  page: "cron:astronomy",
  userId: null,
};
export default function CurrentWeatherCard({
  location,
}: CurrentWeatherCardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Prevent duplicate toasts on re-renders
  const hasToasted = useRef(false);

  // Initial render log
  useEffect(() => {
    logit({
      level: "info",
      message: `Rendering CurrentWeatherCard with location: ${location?.name ?? "null"}`,
      weather: { locationId: location?.id ?? "null" },
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    });
  }, [location]);

  // Fetch weather data
  useEffect(() => {
    if (!location) return;

    async function load(locationId: string) {
      try {
        const res = await fetch(`/api/weather?locationId=${locationId}`);
        const json = await res.json();
        setData(json);

        logit({
          level: "info",
          message: `Weather fetch → ${location!.name} | source: ${json.sources?.current ?? "unknown"}`,
          weather: { locationId, json },
          meta: {
            requestId: ctx.requestId,
            route: ctx.page,
            userId: ctx.userId,
          },
        });
      } catch (error) {
        logit({
          level: "error",
          message: `Error fetching weather data: ${error}`,
          weather: { locationId },
          meta: {
            requestId: ctx.requestId,
            route: ctx.page,
            userId: ctx.userId,
          },
        });
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    hasToasted.current = false;
    load(location.id);
  }, [location]);

  // Toast once when temperature arrives
  useEffect(() => {
    if (!data?.current?.temperature) return;
    if (hasToasted.current) return;

    toast.success(
      `🌡️ ${Math.round(data.current.temperature)}° in ${location?.name}`,
      { duration: 4000 },
    );

    hasToasted.current = true;
  }, [data?.current?.temperature, location?.name]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-white shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
    );
  }

  // Error state
  if (!data?.current) {
    return (
      <div className="p-6 rounded-xl border bg-white shadow-sm">
        <p className="text-gray-600">Unable to load weather data.</p>
      </div>
    );
  }

  // Derived fields
  const { current, sources } = data;

  const temp = Math.round(current.temperature);
  const feelsLike = Math.round(current.feelsLike);
  const humidity = current.humidity;
  const wind = current.windSpeed;
  const source = sources.current?.toUpperCase() ?? "UNKNOWN";
  const fetched = parseLocalTimestamp(current.fetchedAt);
  const formattedTime = fetched ? fetched.toLocaleTimeString() : "—";

  // Final log
  logit({
    level: "info",
    message: `Weather summary for ${location?.name ?? "null"} | ${source} | ${temp}°`,
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    weather: { locationId: location?.id ?? "null", current, sources },
  });

  return (
    <>
      <div className="p-4 rounded-xl bg-linear-to-br from-indigo-700 to-sky-800 border border-white/10 shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Current Weather
        </h3>

        <p className="text-sm text-sky-200 mb-4">
          {location?.name} • {source} • Updated {formattedTime}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm text-white">
          <div>🌡️ Temp: {temp}°</div>
          <div>🥶 Feels like: {feelsLike}°</div>
          <div>💧 Humidity: {humidity}%</div>
          <div>💨 Wind: {wind} mph</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-sky-200">Updated {formattedTime}</div>
    </>
  );
}
