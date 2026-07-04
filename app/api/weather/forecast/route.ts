// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";
import { getConfig } from "@/lib/runtime/config";
const fcm = Number(await getConfig("FORECAST_CACHE_MINUTES", "10"));
const FORECAST_CACHE_MINUTES = fcm;

export async function GET(req: Request) {
  const session = await auth();
  const built = await buildUniversalContext(req as any, "FORECAST");
  let jei = 0;
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing location" }, { status: 400 });
  }

  const location = await db.location.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    return NextResponse.json({ error: "Invalid location" }, { status: 404 });
  }

  // ----------------------------------------
  // CACHE CHECK
  // ----------------------------------------
  const cutoff = new Date(Date.now() - FORECAST_CACHE_MINUTES * 60_000);
  const cached = await db.forecastSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: cutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  if (cached) {
    const age = Math.round((Date.now() - cached.fetchedAt.getTime()) / 60000);
    console.log("age", age);
    await logj({
      domain: "weather",
      level: "info",
      message: `🌟 Forecast cache hit ${age}/${FORECAST_CACHE_MINUTES}`,
      file: "app/api/weather/forecast/route.ts",
      line: 43,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const weather = cached.payload as {
      current: any;
      forecast: any;
    };

    return NextResponse.json({
      source: "cache",
      location,
      ...weather,
      fetchedAt: cached.fetchedAt.toISOString(),
    });
  }

  // ----------------------------------------
  // CACHE MISS → FETCH EXTERNAL API
  // ----------------------------------------
  await logj({
    domain: "weather",
    level: "warn",
    message: "🌟 Forecast cache miss → fetching external API",
    file: "app/api/weather/forecast/route.ts",
    line: 71,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

let raw;

try {
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&current_weather=true` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=fahrenheit` +
      `&timezone=auto`,
    { cache: "no-store" }
  );

  if (!weatherRes.ok) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Open-Meteo returned non-200",
      file: "app/api/weather/forecast/route.ts",
      line: 100,
      payload: { status: weatherRes.status },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return Response.json({ error: "external-api-failed" });
  }

  try {
    raw = await weatherRes.json();
  } catch (err) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Open-Meteo JSON parse failed",
      file: "app/api/weather/forecast/route.ts",
      line: 115,
      payload: { error: String(err) },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return Response.json({ error: "invalid-json" });
  }
} catch (err) {
  await logj({
    domain: "weather",
    level: "error",
    message: "Open-Meteo fetch threw",
    file: "app/api/weather/forecast/route.ts",
    line: 130,
    payload: { error: String(err) },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return Response.json({ error: "fetch-threw" });
}

// ⭐ HARDEN FORECAST: prevent crashes when Open-Meteo returns partial data
const parsed = ForecastResponseSchema.safeParse(raw);

if (!parsed.success) {
  await logj({
    domain: "weather",
    level: "error",
    message: "Forecast unavailable",
    file: "app/api/weather/forecast/route.ts",
    line: 150,
    payload: { raw, issues: parsed.error.flatten() },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  await logj({
    domain: "weather",
    level: "info",
    message: "🌟 Forecast API response",
    file: "app/api/weather/forecast/route.ts",
    line: 95,
    payload: {
      parsed,
      raw,
      locationId,
      cacheWindowMinutes: FORECAST_CACHE_MINUTES,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // ⭐ HARDEN FORECAST: prevent crashes when Open-Meteo returns partial data
  if (!parsed.success) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Forecast unavailable",
      file: "app/api/weather/forecast/route.ts",
      line: 111,
      payload: { raw, issues: parsed.error.flatten() },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json(
      { error: "Forecast unavailable", raw },
      { status: 502 },
    );
  }}

  const daily = parsed.data.daily;

  // ⭐ Guard against missing daily block or missing fields
  if (!daily || !daily.temperature_2m_max) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Forecast unavailable",
      file: "app/api/weather/forecast/route.ts",
      line: 131,
      payload: { raw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json(
      { error: "Forecast unavailable", raw },
      { status: 502 },
    );
  }

  if (!parsed.success) {
    await logj({
      domain: "weather",
      level: "error",
      message: "🌟 Invalid forecast API response",
      file: "app/api/weather/forecast/route.ts",
      line: 148,
      payload: {
        parsed,
        raw,
        locationId,
        cacheWindowMinutes: FORECAST_CACHE_MINUTES,
      },
      meta: {
        built,
      },
    });

    return NextResponse.json(
      { error: "Forecast unavailable" },
      { status: 502 },
    );
  }

  const weather = parsed.data;

  // ----------------------------------------
  // STORE SNAPSHOT
  // ----------------------------------------
  const snapshot = await db.forecastSnapshot.create({
    data: {
      locationId,
      payload: {
        current: weather.current_weather,
        forecast: weather.daily,
      },
    },
  });

  await logj({
    domain: "weather",
    level: "warn",
    message: "🌟 Forecast cache miss → fetching external API",
    file: "app/api/weather/forecast/route.ts",
    line: 186,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  await logj({
    domain: "weather",
    level: "info",
    message: `🌟 Forecast snapshot stored, ${Math.round(weather.current_weather.temperature)}°F`,
    file: "app/api/weather/forecast/route.ts",
    line: 197,

    payload: {
      snapshotId: snapshot.id,
      cacheWindowMinutes: FORECAST_CACHE_MINUTES,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // RETURN FRESH DATA
  // ----------------------------------------
  return NextResponse.json({
    source: "api",
    location,
    current: weather.current_weather,
    forecast: weather.daily,
    fetchedAt: snapshot.fetchedAt.toISOString(),
  });
}
