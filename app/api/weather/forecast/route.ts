// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { enrichContext } from "@/lib/log/context";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";
import { getConfig } from "@/lib/runtime/config";
const fcm = Number(await getConfig("FORECAST_CACHE_MINUTES", "10"));
const FORECAST_CACHE_MINUTES = fcm;
const built = await buildUniversalContext("FORECAST");
console.log("Forecast cache duration (minutes):", FORECAST_CACHE_MINUTES);
export async function GET(req: Request) {
  const session = await auth();

  const ctx = await enrichContext(req as any);
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
  const eventIndex = 22;
  const cached = await db.forecastSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: cutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  if (cached) {
    const age = Math.round((Date.now() - cached.fetchedAt.getTime()) / 60000);
    console.log("age", age);
    await logj(
      "weather",
      "app/api/weather/forecast/route.ts",
      46,
      {
        level: "info",
        message: `Forecast cache hit ${age}/${FORECAST_CACHE_MINUTES}`,
      },
      {
        locationId,
        cacheWindowMinutes: FORECAST_CACHE_MINUTES,
        actualAgeMinutes: age,
      },
      built,
    );

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
  await logj(
    "weather",
    "app/api/weather/forecast/route.ts",
    78,
    {
      level: "info",
      message: "Forecast cache miss → fetching external API",
    },
    {
      locationId,
    },
    built,
  );

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&current_weather=true` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=fahrenheit` +
      `&timezone=auto`,
  );

  const raw = await weatherRes.json();
  const parsed = ForecastResponseSchema.safeParse(raw);
  await logj(
    "weather",
    "app/api/weather/forecast/route.ts",
    104,
    {
      level: "info",
      message: "Forecast API response",
    },
    {
      payload: parsed,
      raw,
      locationId,
      cacheWindowMinutes: FORECAST_CACHE_MINUTES,
    },
    built,
  );
  if (!parsed.success) {
    await logj(
      "weather",
      "app/api/weather/forecast/route.ts",
      121,
      {
        level: "error",
        message: "Invalid forecast API response",
      },
      {
        payload: parsed.error.flatten(),
        locationId,
        cacheWindowMinutes: FORECAST_CACHE_MINUTES,
      },
      built,
    );

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

  await logj(
    "weather",
    "app/api/weather/forecast/route.ts",
    158,
    {
      level: "info",
      message: `Forecast snapshot stored, ${Math.round(weather.current_weather.temperature)}°F`,
    },
    {
      snapshotId: snapshot.id,
      cacheWindowMinutes: FORECAST_CACHE_MINUTES,
    },
    built,
  );

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
