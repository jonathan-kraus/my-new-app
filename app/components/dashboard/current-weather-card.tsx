"use client";

import { formatEasternTime } from "@/lib/utils/global";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

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

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
}

interface WeatherData {
  current?: CurrentWeather;
  sources?: { current?: string };
}

export default function CurrentWeatherCard({
  location,
}: CurrentWeatherCardProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasToasted = useRef(false);

  // Initial render log
  useEffect(() => {
    console.log(
      `Rendering CurrentWeatherCard with location: ${location?.name ?? "null"}`,
    );
  }, [location]);

  // Fetch weather data
  useEffect(() => {
    if (!location) return;

    async function load(locationId: string) {
      try {
        const res = await fetch(`/api/weather?locationId=${locationId}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.log(`Error fetching weather data: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    // Avoid synchronous setState inside effect → wrap in microtask
    queueMicrotask(() => {
      setLoading(true);
      hasToasted.current = false;
      load(location.id);
    });
  }, [location]);

  // React‑pure: compute once, not on every render
  const [formattedTime] = useState(() => {
    return formatEasternTime(Date.now());
  });

  // Toast once when temperature arrives
  useEffect(() => {
    const temp = (data as WeatherData)?.current?.temperature;
    if (!temp) return;
    if (hasToasted.current) return;

    toast.success(`🌡️ ${Math.round(temp)}° in ${location?.name}`, {
      duration: 4000,
    });

    hasToasted.current = true;
  }, [(data as WeatherData)?.current?.temperature, location?.name]);

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
  const current = (data as WeatherData)?.current;
  const sources = (data as WeatherData)?.sources;

  if (!current) {
    return (
      <div className="p-6 rounded-xl border bg-white shadow-sm">
        <p className="text-gray-600">Unable to load weather data.</p>
      </div>
    );
  }

  // Derived fields
  const temp = Math.round(current.temperature);
  const feelsLike = Math.round(current.feelsLike);
  const humidity = current.humidity;
  const wind = current.windSpeed;
  const source = sources?.current?.toUpperCase() ?? "UNKNOWN";

  console.log(`Weather summary for ${location?.name ?? "null"}`);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-700 to-sky-800 border border-white/10 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Current Weather</h3>

      <p className="text-sm text-sky-200 mb-4">
        {location?.name} • {source}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm text-white">
        <div>🌡️ Temp: {temp}°</div>
        <div>🥶 Feels like: {feelsLike}°</div>
        <div>💧 Humidity: {humidity}%</div>
        <div>💨 Wind: {wind} mph</div>
      </div>

      <div className="mt-4 text-sm text-sky-200">Updated {formattedTime}</div>
    </div>
  );
}
