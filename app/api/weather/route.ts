// app/api/weather/route.ts
import { NextResponse } from "next/server";
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

const TomorrowTimelineSchema = z.object({
  data: z.object({
    timelines: z.array(
      z.object({
        intervals: z.array(
          z.object({
            values: z.object({
              sunriseTime: z.string().datetime(),
              sunsetTime: z.string().datetime(),
              moonriseTime: z.string().datetime().nullable(),
              moonsetTime: z.string().datetime().nullable(),
            }),
          }),
        ),
      }),
    ),
  }),
});
// Default cache windows
const CURRENT_CACHE_MIN = 30;
const FORECAST_CACHE_MINUTES = 30;

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

  const currentCacheMin = 30;
  const forecastCacheMin = 30;

  const currentCutoff = new Date(Date.now() - currentCacheMin * 60_000);

  const currentCached = await db.weatherSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: currentCutoff } },
    orderBy: { fetchedAt: "desc" },
  });
  const eventIndex = 22;
  const currentAge = currentCached
    ? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
    : null;

  if (currentCached) {
    await logit(
      "weather",
      {
        level: "info",
        message: `Using cached current weather data`,
        locationId,
        currentAge,
      },
      { eventIndex },
      {
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
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
    return NextResponse.json(
      { error: "Weather fetch failed" },
      { status: 500 },
    );
  }

  const json = await res.json();
  const validated = TomorrowRealtimeSchema.safeParse(json);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid weather data" },
      { status: 500 },
    );
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

  return NextResponse.json({
    location,
    current,
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
}
