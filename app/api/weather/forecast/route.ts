// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";

const FORECAST_CACHE_MINUTES = Number(process.env.FORECAST_CACHE_MINUTES ?? 60);

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
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

  const cached = await db.forecastSnapshot.findFirst({
    where: { locationId, fetchedAt: { gte: cutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  if (cached) {
    const age = Math.round((Date.now() - cached.fetchedAt.getTime()) / 60000);

    await logit({
      level: "info",
      message: `Forecast cache hit ${age}/${FORECAST_CACHE_MINUTES}`,
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      weather: {
        cacheWindowMinutes: FORECAST_CACHE_MINUTES,
        actualAgeMinutes: age,
        sessionUser: session?.user?.name ?? null,
        sessionEmail: session?.user?.email ?? null,
        userId: session?.user?.id ?? null,
        locationId,
        file: "app/api/weather/forecast/route.ts",
      },
    });

    const payload = cached.payload as {
      current: any;
      forecast: any;
    };

    return NextResponse.json({
      source: "cache",
      location,
      ...payload,
      fetchedAt: cached.fetchedAt.toISOString(),
    });
  }

  // ----------------------------------------
  // CACHE MISS → FETCH EXTERNAL API
  // ----------------------------------------
  await logit({
    level: "info",
    message: "Forecast cache miss → fetching external API",
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    weather: { locationId, file: "app/api/weather/forecast/route.ts" },
  });

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

  if (!parsed.success) {
    await logit({
      level: "error",
      message: "Invalid forecast API response",
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      weather: parsed.error.flatten(),
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

  await logit({
    level: "info",
    message: "Forecast snapshot stored",
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    weather: { snapshotId: snapshot.id },
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
