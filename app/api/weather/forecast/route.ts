// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";
import { line } from "better-auth";

const FORECAST_CACHE_MINUTES = Number(
  process.env.FORECAST_CACHE_MINUTES ?? 60
);

export async function GET(req: Request) {
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
    const age = Math.round(
      (Date.now() - cached.fetchedAt.getTime()) / 60000
    );

    await logit({
      level: "info",
      message: "Forecast cache hit",
      file: "app/api/weather/forecast/route.ts",
      data: {
        cacheWindowMinutes: FORECAST_CACHE_MINUTES,
        actualAgeMinutes: age,
        locationId,
        file: "app/api/weather/forecast/route.ts",
        line: 43,
      },
    });

    return NextResponse.json({
      source: "cache",
      location,
      ...cached.payload,
      fetchedAt: cached.fetchedAt.toISOString(),
    });
  }

  // ----------------------------------------
  // CACHE MISS → FETCH EXTERNAL API
  // ----------------------------------------
  await logit({
    level: "info",
    message: "Forecast cache miss → fetching external API",
    file: "app/api/weather/forecast/route.ts",
    data: { locationId,
      file: "app/api/weather/forecast/route.ts",
      line: 67,
     },
  });

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&current_weather=true` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=fahrenheit` +
      `&timezone=auto`
  );

  const raw = await weatherRes.json();
  const parsed = ForecastResponseSchema.safeParse(raw);

  if (!parsed.success) {
    await logit({
      level: "error",
      message: "Invalid forecast API response",
      file: "app/api/weather/forecast/route.ts",
      line: 91,
      data: parsed.error.flatten(),
    });

    return NextResponse.json(
      { error: "Forecast unavailable" },
      { status: 502 }
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

  await logit({
    level: "info",
    message: "Forecast snapshot stored",
    file: "app/api/weather/forecast/route.ts",
    line: 120,
    data: { snapshotId: snapshot.id },
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
