// lib/weather/get-weather.ts
import { db } from "@/lib/db";
import { z } from "zod";
import { logj } from "@/lib/log/logj";

const API_KEY = process.env.TOMORROWIO_APIKEY!;

// Zod schema for Tomorrow.io realtime response
const TomorrowRealtimeSchema = z.object({
  data: z.object({
    values: z.object({
      temperature: z.number(),
      temperatureApparent: z.number().nullable(),
      humidity: z.number().nullable(),
      windSpeed: z.number().nullable(),
      windDirection: z.number().nullable(),
      pressureSurfaceLevel: z.number().nullable(),
      visibility: z.number().nullable(),
      weatherCode: z.number().nullable(),
    }),
  }),
});

export type WeatherResult = {
  location: unknown;
  current: unknown | null;
  forecast: unknown | null;
  astronomy?: unknown | null;
  sources: { current: string; forecast?: string; astronomy?: string };
  ages: { currentMinutes: number | null; forecastMinutes?: number | null; astronomyHours?: number | null };
};

/**
 * Fetch or return cached weather for a location.
 * Returns the same JSON shape the API route previously returned.
 */
export async function getWeatherForLocation(locationId: string, opts?: { logContext?: Record<string, unknown> }) {
  const logContext = opts?.logContext ?? {};
  // Validate location exists
  const location = await db.location.findUnique({ where: { id: locationId } });
  if (!location) {
    throw new Error("Invalid locationId");
  }

  // Cache policy (minutes)
  const CURRENT_CACHE_MIN = 30;
  const currentCutoff = new Date(Date.now() - CURRENT_CACHE_MIN * 60_000);

  const currentCached = await db.weatherSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: currentCutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  const currentAge = currentCached
    ? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
    : null;

  if (currentCached) {
    await logj({
      domain: "weather",
      level: "info",
      message: "Using cached current weather data",
      file: "lib/weather/get-weather.ts",
      payload: { locationId, ...logContext },
    });

    return {
      location,
      current: currentCached,
      forecast: null,
      astronomy: null,
      sources: { current: "cache", forecast: "disabled", astronomy: "disabled" },
      ages: { currentMinutes: currentAge, forecastMinutes: null, astronomyHours: null },
    } as WeatherResult;
  }

  // Fetch from Tomorrow.io
  const res = await fetch(
    `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
  );

  if (!res.ok) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Tomorrow.io fetch failed",
      file: "lib/weather/get-weather.ts",
      payload: { status: res.status, locationId, ...logContext },
    });
    throw new Error("Weather fetch failed");
  }

  const json = await res.json();
  const validated = TomorrowRealtimeSchema.safeParse(json);

  await logj({
    domain: "weather",
    level: "info",
    message: "Fetched current weather data",
    file: "lib/weather/get-weather.ts",
    payload: { status: res.status, locationId, valid: validated.success },
  });

  if (!validated.success) {
    throw new Error("Invalid weather data");
  }

  const v = validated.data.data.values;

  const current = await db.weatherSnapshot.create({
    data: {
      locationId,
      temperature: v.temperature,
      feelsLike: v.temperatureApparent,
      humidity: v.humidity,
      windSpeed: v.windSpeed,
      windDirection: v.windDirection,
      pressure: v.pressureSurfaceLevel,
      visibility: v.visibility,
      weatherCode: v.weatherCode,
    },
  });

  return {
    location,
    current,
    forecast: null,
    sources: { current: "api", forecast: "disabled" },
    ages: { currentMinutes: currentAge, forecastMinutes: null },
  } as WeatherResult;
}
