
// app/api/weather/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { getRuntimeNumber } from "@/lib/runtimeConfig"; // you'll create this helper

const API_KEY = process.env.TOMORROWIO_APIKEY!;

// Default cache windows (fallbacks)
const DEFAULT_CURRENT_MIN = Number(process.env.WEATHER_CACHE_MINUTES ?? 10);
const DEFAULT_FORECAST_MIN = Number(process.env.FORECAST_CACHE_MINUTES ?? 30);
const DEFAULT_ASTRONOMY_HOURS = Number(process.env.ASTRONOMY_CACHE_HOURS ?? 24);

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

  // Resolve runtime cache windows
  const currentCacheMin = await getRuntimeNumber("WEATHER_CACHE_MINUTES", DEFAULT_CURRENT_MIN);
  const forecastCacheMin = await getRuntimeNumber("FORECAST_CACHE_MINUTES", DEFAULT_FORECAST_MIN);
  const astronomyCacheHours = await getRuntimeNumber("ASTRONOMY_CACHE_HOURS", DEFAULT_ASTRONOMY_HOURS);

  // ----------------------------------------
  // CURRENT WEATHER (cached)
  // ----------------------------------------
  const currentCutoff = new Date(Date.now() - currentCacheMin * 60_000);

  const currentCached = await db.weatherSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: currentCutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  const currentAge = currentCached
    ? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
    : null;

  let current;
  let currentSource: "cache" | "api";

  if (currentCached) {
    current = currentCached;
    currentSource = "cache";
  } else {
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
      { headers: { accept: "application/json" } }
    );

    if (!res.ok) {
      await logit({
        level: "error",
        message: "Realtime weather fetch failed",
        page: "/api/weather",
        file: "app/api/weather/route.ts",
        line:  61,
        data: { status: res.status },
      });
      return NextResponse.json({ error: "Weather fetch failed" }, { status: 500 });
    }

    const json = await res.json();
    const v = json.data.values;

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
  // FORECAST (cached)
  // ----------------------------------------
  const forecastCutoff = new Date(Date.now() - forecastCacheMin * 60_000);

  const forecastCached = await db.forecastSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: forecastCutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  const forecastAge = forecastCached
    ? Math.round((Date.now() - forecastCached.fetchedAt.getTime()) / 60000)
    : null;

  let forecast;
  let forecastSource: "cache" | "api";

  if (forecastCached) {
    forecast = forecastCached.payload;
    forecastSource = "cache";
  } else {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto`
    );

    const raw = await res.json();

    forecast = {
      current: raw.current_weather,
      daily: raw.daily,
    };

    await db.forecastSnapshot.create({
      data: {
        locationId,
        payload: forecast,
      },
    });

    forecastSource = "api";
  }

  // ----------------------------------------
// ASTRONOMY (cached)
// ----------------------------------------
const astronomyCutoff = new Date(Date.now() - astronomyCacheHours * 60 * 60_000);

const astronomyCached = await db.astronomySnapshot.findFirst({
  where: { locationId, fetchedAt: { gte: astronomyCutoff } },
  orderBy: { fetchedAt: "desc" },
});

const astronomyAge = astronomyCached
  ? Math.round((Date.now() - astronomyCached.fetchedAt.getTime()) / 3600000)
  : null;

let astronomy;
let astronomySource: "cache" | "api";

if (astronomyCached) {
  astronomy = {
    sunrise: astronomyCached.sunrise,
    sunset: astronomyCached.sunset,
    moonrise: astronomyCached.moonrise,
    moonset: astronomyCached.moonset,
  };
  astronomySource = "cache";
} else {
  // Fetch astronomy from your API of choice
  const res = await fetch(
    `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${location.latitude}&longitude=${location.longitude}`
  );
  const raw = await res.json();

  // Map API response to your model fields
  const sunrise = new Date(raw.data.sun.sunrise);
  const sunset = new Date(raw.data.sun.sunset);
  const moonrise = raw.data.moon.moonrise ? new Date(raw.data.moon.moonrise) : null;
  const moonset = raw.data.moon.moonset ? new Date(raw.data.moon.moonset) : null;

  await db.astronomySnapshot.create({
    data: {
      locationId,
      sunrise,
      sunset,
      moonrise,
      moonset,
    },
  });

  astronomy = { sunrise, sunset, moonrise, moonset };
  astronomySource = "api";
}


  // ----------------------------------------
  // LOG EVERYTHING
  // ----------------------------------------
  await logit({
    level: "info",
    message: "Unified weather request",
    page: "/api/weather",
    file: "app/api/weather/route.ts",
    line: 176,
    data: {
      locationId,
      sources: {
        current: currentSource,
        forecast: forecastSource,
        astronomy: astronomySource,
      },
      ages: {
        currentMinutes: currentAge,
        forecastMinutes: forecastAge,
        astronomyHours: astronomyAge,
      },
      cacheWindows: {
        currentMinutes: currentCacheMin,
        forecastMinutes: forecastCacheMin,
        astronomyHours: astronomyCacheHours,
      },
    },
  });

  // ----------------------------------------
  // RETURN EVERYTHING
  // ----------------------------------------
  return NextResponse.json({
    location,
    current,
    forecast,
    astronomy,
    sources: {
      current: currentSource,
      forecast: forecastSource,
      astronomy: astronomySource,
    },
  });
}
