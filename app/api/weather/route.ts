// app/api/weather/route.ts
import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { db } from "@/lib/db";
import { z } from "zod";
import { logit } from "@/lib/log/logit";

const API_KEY = process.env.TOMORROWIO_APIKEY!;

// Zod schemas
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

// Default cache windows
const CURRENT_CACHE_MIN = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  const location = await db.location.findUnique({ where: { id: locationId } });
  if (!location) {
    return NextResponse.json({ error: "Invalid locationId" }, { status: 404 });
  }

  const currentCutoff = new Date(Date.now() - CURRENT_CACHE_MIN * 60_000);

  const currentCached = await db.weatherSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: currentCutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  const currentAge = currentCached
    ? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
    : null;

  // Cached path — fast return
  if (currentCached) {
    waitUntil(
      logit("weather", {
        level: "info",
        message: "Using cached current weather data",
        payload: { locationId, currentAge },
      }),
    );

    return NextResponse.json({
      location,
      current: currentCached,
      forecast: null,
      astronomy: null,
      sources: {
        current: "cache",
        forecast: "disabled",
        astronomy: "disabled",
      },
      ages: {
        currentMinutes: currentAge,
        forecastMinutes: null,
        astronomyHours: null,
      },
    });
  }

  // Fetch from Tomorrow.io
  const res = await fetch(
    `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
  );

  if (!res.ok) {
    waitUntil(
      logit("weather", {
        level: "error",
        message: "Weather fetch failed",
        payload: { locationId, status: res.status },
      }),
    );

    return NextResponse.json(
      { error: "Weather fetch failed" },
      { status: 500 },
    );
  }

  const json = await res.json();
  const validated = TomorrowRealtimeSchema.safeParse(json);

  if (!validated.success) {
    waitUntil(
      logit("weather", {
        level: "error",
        message: "Invalid weather data from Tomorrow.io",
        payload: { locationId, json },
      }),
    );

    return NextResponse.json(
      { error: "Invalid weather data" },
      { status: 500 },
    );
  }

  const v = validated.data.data.values;

  // Create the response immediately — do not block on DB writes
  const response = NextResponse.json({
    location,
    current: {
      locationId,
      temperature: v.temperature,
      feelsLike: v.temperatureApparent,
      humidity: v.humidity,
      windSpeed: v.windSpeed,
      windDirection: v.windDirection,
      pressure: v.pressureSurfaceLevel,
      visibility: v.visibility,
      weatherCode: v.weatherCode,
      fetchedAt: new Date(),
    },
    forecast: null,
    sources: {
      current: "api",
      forecast: "disabled",
    },
    ages: {
      currentMinutes: currentAge,
      forecastMinutes: null,
    },
  });

  // Background work — guaranteed to finish
  waitUntil(
    Promise.all([
      db.weatherSnapshot.create({
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
      }),
      logit("weather", {
        level: "info",
        message: "Fetched fresh weather data",
        payload: { locationId },
      }),
    ]),
  );

  return response;
}
