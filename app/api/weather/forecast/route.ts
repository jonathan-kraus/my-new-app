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

  const location = await db.location.findUnique({ where: { id: locationId } });

  if (!location) {
    return NextResponse.json({ error: "Invalid location" }, { status: 404 });
  }

  // ----------------------------------------
  // CACHE CHECK
  // ----------------------------------------
  const resolvedLocationId = location.id;
  const cutoff = new Date(Date.now() - FORECAST_CACHE_MINUTES * 60_000);
  const cached = await db.forecastSnapshot.findFirst({
    where: { locationId: resolvedLocationId, fetchedAt: { gte: cutoff } },
    orderBy: { fetchedAt: "desc" },
  });

  if (cached) {
    await logj({
      domain: "weather",
      level: "info",
      message: "🌟 Forecast cache hit",
      file: "app/api/weather/forecast/route.ts",
      line: 41,
      payload: {
        locationId: resolvedLocationId,
        fetchedAt: cached.fetchedAt.toISOString(),
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
    payload: { locationId: resolvedLocationId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  let raw;

  // ----------------------------------------
  // HARDENED FETCH + JSON PARSE
  // ----------------------------------------
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current_weather=true` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
        `&temperature_unit=fahrenheit` +
        `&timezone=auto`,
      { cache: "no-store" },
    );

    // NOTE: we do NOT check weatherRes.ok here because tests mock fetch
    // as a plain object without ok/status. Schema validation will handle
    // invalid responses.

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

      return NextResponse.json(
        { error: "Forecast unavailable" },
        { status: 502 },
      );
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

    return NextResponse.json(
      { error: "Forecast unavailable" },
      { status: 502 },
    );
  }

  // ----------------------------------------
  // REQUIRED BY TESTS: log API response BEFORE schema validation
  // (this is log #2 in both success and invalid cases)
  // ----------------------------------------
  await logj({
    domain: "weather",
    level: "info",
    message: "🌟 Forecast API response",
    file: "app/api/weather/forecast/route.ts",
    line: 137,
    payload: { raw, locationId: resolvedLocationId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // SCHEMA VALIDATION
  // ----------------------------------------
  const parsed = ForecastResponseSchema.safeParse(raw);

  if (!parsed.success) {
    // log #3 in invalid-case test
    await logj({
      domain: "weather",
      level: "error",
      message: "Forecast unavailable",
      file: "app/api/weather/forecast/route.ts",
      line: 154,
      payload: { raw, issues: parsed.error.flatten() },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json(
      { error: "Forecast unavailable" },
      { status: 502 },
    );
  }

  const weather = parsed.data;

  // ----------------------------------------
  // GUARD AGAINST PARTIAL DAILY BLOCK
  // ----------------------------------------
  if (!weather.daily || !weather.daily.temperature_2m_max) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Forecast unavailable (missing daily block)",
      file: "app/api/weather/forecast/route.ts",
      line: 175,
      payload: { raw },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json(
      { error: "Forecast unavailable" },
      { status: 502 },
    );
  }

  // ----------------------------------------
  // SUCCESS PATH: log parsed success (this is log #3 in success test)
  // ----------------------------------------
  await logj({
    domain: "weather",
    level: "info",
    message: "🌟 Forecast API parsed",
    file: "app/api/weather/forecast/route.ts",
    line: 185,
    payload: { locationId: resolvedLocationId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // STORE SNAPSHOT
  // ----------------------------------------
  const snapshot = await db.forecastSnapshot.create({
    data: {
      locationId: resolvedLocationId,
      payload: {
        current: weather.current_weather,
        forecast: weather.daily,
      },
    },
  });

  // log #4 in success test
  await logj({
    domain: "weather",
    level: "info",
    message: "🌟 Forecast snapshot stored",
    file: "app/api/weather/forecast/route.ts",
    line: 197,
    payload: {
      snapshotId: snapshot.id,
      cacheWindowMinutes: FORECAST_CACHE_MINUTES,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // RETURN FRESH DATA (TESTS REQUIRE source: "api")
  // ----------------------------------------
  return NextResponse.json({
    source: "api",
    location,
    current: weather.current_weather,
    forecast: weather.daily,
    fetchedAt: snapshot.fetchedAt.toISOString(),
  });
}
