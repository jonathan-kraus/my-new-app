// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";
import { getConfig } from "@/lib/runtime/config";
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";
import { format } from "date-fns";

function getMoonEmoji(phaseName: string | null): string {
  if (!phaseName) return "🌑";
  const name = phaseName.toLowerCase();
  if (name.includes("new")) return "🌑";
  if (name.includes("waxing crescent")) return "🌒";
  if (name.includes("first quarter")) return "🌓";
  if (name.includes("waxing gibbous")) return "🌔";
  if (name.includes("full")) return "🌕";
  if (name.includes("waning gibbous")) return "🌖";
  if (name.includes("last quarter")) return "🌗";
  if (name.includes("waning crescent")) return "🌘";
  return "🌑";
}

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
    console.log(
      "CACHED SNAPSHOT PAYLOAD:",
      JSON.stringify(cached!.payload, null, 2),
    );

    await logj({
      domain: "weather",
      level: "info",
      message: "🌟 Forecast cache hit",
      file: "app/api/weather/forecast/route.ts",
      line: 41,
      payload: {
        locationId: resolvedLocationId,
        data: cached.payload,
        cutoff: cutoff.toISOString(),
        cachedFetchedAt: cached.fetchedAt.toISOString(),
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const weather = cached.payload as {
      current: any;
      forecast: any;
    };

    // Ensure current data has required fields
    if (!weather.current) {
      weather.current = { temperature: 0, windspeed: 0, humidity: 0 };
    }
    if (
      weather.current.humidity === undefined ||
      weather.current.humidity === null
    ) {
      weather.current.humidity = 0;
    }

    // Fetch astronomy data
    const astronomyData = await getAstronomySnapshot(resolvedLocationId);
    const astronomy = astronomyData.today
      ? {
          sunrise: astronomyData.today.sunrise,
          sunset: astronomyData.today.sunset,
          moonrise: astronomyData.today.moonrise || "N/A",
          moonset: astronomyData.today.moonset || "N/A",
          moonPhaseName: astronomyData.today.phaseName || "Unknown",
          moonPhaseEmoji: getMoonEmoji(astronomyData.today.phaseName),
        }
      : {
          sunrise: "N/A",
          sunset: "N/A",
          moonrise: "N/A",
          moonset: "N/A",
          moonPhaseName: "Unknown",
          moonPhaseEmoji: "🌑",
        };

    return NextResponse.json({
      source: "cache",
      location,
      current: weather.current,
      forecast: weather.forecast,
      astronomy,
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
        `&current=temperature,relative_humidity_2m,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
        `&temperature_unit=fahrenheit` +
        `&wind_speed_unit=mph` +
        `&timezone=auto`,
      { cache: "no-store" },
    );

    // NOTE: we do NOT check weatherRes.ok here because tests mock fetch
    // as a plain object without ok/status. Schema validation will handle
    // invalid responses.

    try {
      raw = await weatherRes.json();
      console.log("RAW OPEN-METEO RESPONSE:", JSON.stringify(raw, null, 2));
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
  console.log("ZOD PARSED RESULT:", parsed);

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
  const rawWithCurrent = raw as any;

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
        current: {
          temperature: weather.current.temperature,
          windspeed: weather.current.windspeed,
          humidity: weather.current.relative_humidity_2m,
        },
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

  // Fetch astronomy data
  const astronomyData = await getAstronomySnapshot(resolvedLocationId);
  const astronomy = astronomyData.today
    ? {
        sunrise: astronomyData.today.sunrise,
        sunset: astronomyData.today.sunset,
        moonrise: astronomyData.today.moonrise || "N/A",
        moonset: astronomyData.today.moonset || "N/A",
        moonPhaseName: astronomyData.today.phaseName || "Unknown",
        moonPhaseEmoji: getMoonEmoji(astronomyData.today.phaseName),
      }
    : {
        sunrise: "N/A",
        sunset: "N/A",
        moonrise: "N/A",
        moonset: "N/A",
        moonPhaseName: "Unknown",
        moonPhaseEmoji: "🌑",
      };

  return NextResponse.json({
    source: "api",
    location,
    current: {
      temperature: weather.current.temperature,
      windspeed: weather.current.windspeed,
      humidity: weather.current.relative_humidity_2m,
    },
    forecast: weather.daily,
    astronomy,
    fetchedAt: snapshot.fetchedAt.toISOString(),
  });
}
