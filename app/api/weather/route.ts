import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { getRuntimeNumber } from "@/lib/runtimeConfig";

const API_KEY = process.env.TOMORROWIO_APIKEY!;

// Default cache windows
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

  // Runtime overrides
  const currentCacheMin = await getRuntimeNumber("WEATHER_CACHE_MINUTES", DEFAULT_CURRENT_MIN);
  const forecastCacheMin = await getRuntimeNumber("FORECAST_CACHE_MINUTES", DEFAULT_FORECAST_MIN);
  const astronomyCacheHours = await getRuntimeNumber(
    "ASTRONOMY_CACHE_HOURS",
    DEFAULT_ASTRONOMY_HOURS,
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

  let current;
  let currentSource: "cache" | "api";

  if (currentCached) {
    current = currentCached;
    currentSource = "cache";
  } else {
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
    );

    if (!res.ok) {
      await logit({
        level: "error",
        message: "Realtime weather fetch failed",
        page: "/api/weather",
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
  // FORECAST (temporarily disabled)
  // ----------------------------------------
  const forecast = null;
  const forecastSource = "disabled";
  const forecastAge = null;

  // ----------------------------------------
  // ASTRONOMY (NOW ENABLED via Tomorrow.io Timelines)
  // ----------------------------------------
  const astronomyCutoff = new Date(Date.now() - astronomyCacheHours * 60 * 60_000);

  // Check cache first
  const astronomyCached = await db.weatherSnapshot.findFirst({
    where: {
      locationId,
      fetchedAt: { gte: astronomyCutoff },
      // Assuming you have astronomy fields in weatherSnapshot or separate table
      // For now, we'll fetch fresh since schema might not have astronomy yet
    },
    orderBy: { fetchedAt: "desc" },
  });

  let astronomy;
  let astronomySource: "cache" | "api" | "disabled";
  const astronomyAge = astronomyCached
    ? Math.round((Date.now() - astronomyCached.fetchedAt.getTime()) / 3600000)
    : null;

  if (astronomyCached && astronomyCached.sunriseTime && astronomyCached.sunsetTime) {
    // Use cached if enriched (you'll need to add these fields to schema/migrations)
    astronomy = {
      sunrise: astronomyCached.sunriseTime,
      sunset: astronomyCached.sunsetTime,
      source: "tomorrow.io" as const,
      fetchedAt: astronomyCached.fetchedAt.toISOString(),
    };
    astronomySource = "cache";
  } else {
    // Fresh API call - Tomorrow.io timelines for today + astronomy
    const timelineBody = {
      location: `${location.latitude},${location.longitude}`,
      fields: [
        "sunriseTime",
        "sunsetTime",
        // Add "moonPhase", "moonriseTime", "moonsetTime" if available in your plan
      ],
      units: "imperial",
      timesteps: ["1d"],
      startTime: new Date().toISOString().split("T")[0], // Today only
      endTime: new Date().toISOString().split("T")[0],
    };

    const res = await fetch("https://api.tomorrow.io/v4/timelines", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: API_KEY },
      body: JSON.stringify(timelineBody),
    });

    if (!res.ok) {
      await logit({
        level: "warn",
        message: "Astronomy fetch failed, disabling",
        page: "/api/weather",
        data: { status: res.status },
      });
      astronomy = null;
      astronomySource = "disabled";
    } else {
      const json = await res.json();
      const dailyData = json.data.timelines?.[0]?.intervals?.[0]?.values;

      if (dailyData?.sunriseTime && dailyData?.sunsetTime) {
        astronomy = {
          sunrise: dailyData.sunriseTime,  // ISO string e.g. "2026-01-04T12:15:00Z"
          sunset: dailyData.sunsetTime,
          source: "tomorrow.io" as const,
          fetchedAt: new Date().toISOString(),
        };

        // TODO: Enrich cache - add to your weatherSnapshot or new table
        // await db.weatherSnapshot.updateMany({... sunriseTime: dailyData.sunriseTime, etc.});

        astronomySource = "api";
      } else {
        astronomy = null;
        astronomySource = "disabled";
      }
    }
  }

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
    astronomy,  // Now has { sunrise, sunset, source, fetchedAt }
    sources: {
      current: currentSource,
      forecast: forecastSource,
      astronomy: astronomySource,
    },
  });
}
