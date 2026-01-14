// app/api/weather/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { logit } from "@/lib/log/server";
import { auth } from "@/lib/auth";
import { getRuntimeNumber } from "@/lib/runtimeConfig";
import { enrichContext } from "@/lib/log/context";
import { NextRequest } from "next/server";

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
const DEFAULT_CURRENT_MIN = Number(process.env.WEATHER_CACHE_MINUTES ?? 10);
const DEFAULT_FORECAST_MIN = Number(process.env.FORECAST_CACHE_MINUTES ?? 30);

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  const location = await db.location.findUnique({ where: { id: locationId } });
  if (!location) {
    return NextResponse.json({ error: "Invalid locationId" }, { status: 404 });
  }

  // Runtime overrides
  const currentCacheMin = await getRuntimeNumber(
    "WEATHER_CACHE_MINUTES",
    DEFAULT_CURRENT_MIN,
  );
  const forecastCacheMin = await getRuntimeNumber(
    "FORECAST_CACHE_MINUTES",
    DEFAULT_FORECAST_MIN,
  );

  // ----------------------------------------
  // CURRENT WEATHER (working)
  // ----------------------------------------
  const currentCutoff = new Date(Date.now() - currentCacheMin * 60_000);

  const currentCached = await db.weatherSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: currentCutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  const currentAge = currentCached
    ? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
    : null;

  if (currentCached) {
    const ctx = await enrichContext(req);
    const start = performance.now();
    let eventIndex = 0;
    const nextEvent = () => eventIndex++;


await logit({
  ...ctx,
  level: "info",
  message: `Using cached current weather data ${currentAge}/${currentCacheMin}`,
  file: "app/api/weather/route.ts",
  page: "/api/weather",
  eventIndex: nextEvent(),
  durationMs: performance.now() - start,
  data: {
    user: session?.user?.name || "Guest",
    cacheWindowMinutes: currentCacheMin,
    actualAgeMinutes: currentAge,
    locationId,
  },
});


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

      headers: {
        "x-status-code": "200", // 👈 Inject for logging
      },
    });
  }

  let current;
  let currentSource: "cache" | "api";

  if (currentCached) {
    current = currentCached;
    currentSource = "cache";
  } else {
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
    );
    const ctx = await enrichContext(req);
    await logit({
      ...ctx,
      level: "info",
      message: "Realtime weather fetch attempted",
      page: "/api/weather",
      file: "app/api/weather/route.ts",
      data: { status: res },
    });
    if (!res.ok) {
      await logit({
        ...ctx,
        level: "error",
        message: "Realtime weather fetch failed",
        page: "/api/weather",
        file: "app/api/weather/route.ts",

        data: { status: res.status },
      });
      return NextResponse.json(
        { error: "Weather fetch failed" },
        { status: 500 },
      );
    }

    const json = await res.json();
    const validated = TomorrowRealtimeSchema.safeParse(json);

    if (!validated.success) {
      await logit({
        ...ctx,
        level: "error",
        message: "Realtime weather validation failed",
        page: "/api/weather",
        data: { issues: validated.error.issues.slice(0, 3) }, // ✅ Fixed
      });
      return NextResponse.json(
        { error: "Invalid weather data" },
        { status: 500 },
      );
    }

    const v = validated.data.data.values;

    current = await db.weatherSnapshot.create({
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

    currentSource = "api";
  }

  // ----------------------------------------
  // FORECAST (temporarily disabled)
  // ----------------------------------------
  const forecast = null;
  const forecastSource = "disabled";
  const forecastAge = null;

  // ----------------------------------------
  // LOG EVERYTHING
  // ----------------------------------------
  await logit({
    level: "info",
    message: "Unified weather request",
    page: "/api/weather",
    data: {
      locationId,
      sources: {
        current: currentSource,
        forecast: forecastSource,
        astronomy: "disabled",
      },
      ages: {
        currentMinutes: currentAge,
        forecastMinutes: forecastAge,
        astronomyHours: null,
      },
      cacheWindows: {
        currentMinutes: currentCacheMin,
        forecastMinutes: forecastCacheMin,
      },
      file: "app/api/weather/route.ts",
    },
  });

  // ----------------------------------------
  // RETURN EVERYTHING
  // ----------------------------------------
  return NextResponse.json({
    location,
    current,
    forecast: forecast ?? null,

    sources: {
      current: currentSource,
      forecast: forecastSource,
    },
    ages: {
      currentMinutes: currentAge,
      forecastMinutes: forecastAge,
    },
  });
}
