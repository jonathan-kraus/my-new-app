// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { createId } from "@paralleldrive/cuid2";
import { logj } from "@/lib/log/logj";
import { timestampString } from "@/lib/timestampString";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";
import { getConfig } from "@/lib/runtime/config";
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

function getMoonEmoji(phaseName: string | null): string {
  if (!phaseName) return "🌑";
  const name = phaseName.toLowerCase();
  if (name.includes("new")) return "🌑";
  if (name.includes("waxing crescent")) return "🌒";
  if (name.includes("first_quarter")) return "🌓";
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
  const built = await buildUniversalContext(req, "FORECAST");
  let jei = 0;
  const requestId = req.headers.get("x-app-request-id");

  const proxyStartedAtHeader = req.headers.get("x-app-request-started-at");

  const proxyStartedAt = proxyStartedAtHeader
    ? Number(proxyStartedAtHeader)
    : null;

  const forecastStartedAt = performance.now();
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing location" }, { status: 400 });
  }

  const location = await db8.orm.public.Location.where({
    id: locationId,
  }).first();

  if (!location) {
    return NextResponse.json({ error: "Invalid location" }, { status: 404 });
  }

  // ----------------------------------------
  // CACHE CHECK
  // ----------------------------------------
  const resolvedLocationId = location.id;
  const cutoff = new Date(Date.now() - FORECAST_CACHE_MINUTES * 60_000);
  const cached = await db8.orm.public.ForecastSnapshot.where((snapshot) =>
    snapshot.locationId.eq(resolvedLocationId),
  )
    .where((snapshot) =>
      snapshot.fetchedAt.gte(timestampString(cutoff.toISOString())),
    )
    .orderBy((snapshot) => snapshot.fetchedAt.desc())
    .first();

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
      line: 76,
      payload: {
        locationId: resolvedLocationId,
        data: cached.payload,
        cutoff: cutoff.toISOString(),
        cachedFetchedAt: cached.fetchedAt,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const weather = cached.payload as {
      current: {
        temperature: number;
        windspeed: number;
        humidity?: number | null;
      };
      forecast: {
        time?: string[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        highs?: number[];
        lows?: number[];
        weathercode?: number[];
      };
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

    // Ensure forecast data has required structure
    if (!weather.forecast) {
      weather.forecast = {
        time: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        weathercode: [],
      };
    } else {
      // Normalize forecast structure if it has old format
      if (!weather.forecast.temperature_2m_max && weather.forecast.highs) {
        weather.forecast.temperature_2m_max = weather.forecast.highs;
      }
      if (!weather.forecast.temperature_2m_min && weather.forecast.lows) {
        weather.forecast.temperature_2m_min = weather.forecast.lows;
      }
      if (!weather.forecast.time) {
        weather.forecast.time = [];
      }
      if (!weather.forecast.weathercode) {
        weather.forecast.weathercode = [];
      }
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
      forecast: {
        time: weather.forecast.time || [],
        temperature_2m_max: weather.forecast.temperature_2m_max || [],
        temperature_2m_min: weather.forecast.temperature_2m_min || [],
        weathercode: weather.forecast.weathercode || [],
      },
      astronomy,
      fetchedAt: cached.fetchedAt,
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
    line: 169,
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
        line: 205,
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
      line: 221,
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
    line: 241,
    payload: { raw, locationId: resolvedLocationId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // SCHEMA VALIDATION
  // ----------------------------------------
  const parsed = ForecastResponseSchema.safeParse(raw);
  console.log("ZOD PARSED RESULT:", parsed);
  const forecastDurationMs = performance.now() - forecastStartedAt;

  const totalDurationMs =
    proxyStartedAt !== null && Number.isFinite(proxyStartedAt)
      ? Date.now() - proxyStartedAt
      : null;
  await logj({
    domain: "weather",
    level: "info",
    message: "Forecast page data completed",
    file: "app/api/weather/forecast/route.ts",
    line: 262,
    payload: {
      requestId: requestId || undefined,
      forecastDurationMs: Number(forecastDurationMs.toFixed(3)),
      totalDurationMs,
    },
  });
  if (!parsed.success) {
    // log #3 in invalid-case test
    await logj({
      domain: "weather",
      level: "error",
      message: "Forecast unavailable",
      file: "app/api/weather/forecast/route.ts",
      line: 276,
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
      line: 300,
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
    line: 319,
    payload: { locationId: resolvedLocationId },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // ----------------------------------------
  // STORE SNAPSHOT
  // ----------------------------------------
  const snapshot = await db8.orm.public.ForecastSnapshot.create({
    id: createId(),
    locationId: resolvedLocationId,
    fetchedAt: timestampString(new Date().toISOString()),
    payload: {
      current: {
        temperature: weather.current.temperature,
        windspeed: weather.current.wind_speed_10m,
        humidity: weather.current.relative_humidity_2m ?? null,
      },
      forecast: {
        time: weather.daily.time,
        temperature_2m_max: weather.daily.temperature_2m_max,
        temperature_2m_min: weather.daily.temperature_2m_min,
        weathercode: weather.daily.weathercode,
      },
    },
  });

  // log #4 in success test
  await logj({
    domain: "weather",
    level: "info",
    message: "🌟 Forecast snapshot stored",
    file: "app/api/weather/forecast/route.ts",
    line: 352,
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
      windspeed: weather.current.wind_speed_10m,
      humidity: weather.current.relative_humidity_2m,
    },
    forecast: {
      time: weather.daily.time,
      temperature_2m_max: weather.daily.temperature_2m_max,
      temperature_2m_min: weather.daily.temperature_2m_min,
      weathercode: weather.daily.weathercode,
    },
    astronomy,
    fetchedAt: snapshot.fetchedAt,
  });
}
