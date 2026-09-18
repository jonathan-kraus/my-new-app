// app/api/weather/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { db8 } from "@/lib/db.prisma8";
import { z } from "zod";
import { logj } from "@/lib/log/logj";
import { timestampString } from "@/lib/timestampString";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

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

export async function GET(req: NextRequest) {
  const built = await buildUniversalContext(req, "WEATHER");
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  const location = await db8.orm.public.Location.where({
    id: locationId,
  }).first();

  if (!location) {
    return NextResponse.json({ error: "Invalid locationId" }, { status: 404 });
  }

  const currentCacheMin = 30;
  let jei = 0;
  const currentCutoff = new Date(Date.now() - currentCacheMin * 60_000);

  const currentCached = await db8.orm.public.WeatherSnapshot.where((snapshot) =>
    snapshot.locationId.eq(locationId),
  )
    .where((snapshot) =>
      snapshot.fetchedAt.gte(timestampString(currentCutoff.toISOString())),
    )
    .orderBy((snapshot) => snapshot.fetchedAt.desc())
    .first();

  const currentAge = currentCached
    ? Math.round(
        (Date.now() - new Date(currentCached.fetchedAt).getTime()) / 60000,
      )
    : null;

  if (currentCached) {
    await logj({
      domain: "weather",
      level: "info",
      message: "Using cached current weather data",
      file: "app/api/weather/route.ts",
      line: 66,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
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
    });
  }

  // Fetch from Tomorrow.io
  const res = await fetch(
    `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Tomorrow.io weather failed:", res.status, errorText);

    return NextResponse.json(
      { error: "Weather fetch failed", status: res.status },
      { status: 500 },
    );
  }

  const json = await res.json();
  const validated = TomorrowRealtimeSchema.safeParse(json);
  await logj({
    domain: "weather",
    level: "info",
    message: "Fetched current weather data",
    file: "app/api/weather/route.ts",
    line: 113,
    payload: {
      some: res.status,
      validated: validated,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid weather data" },
      { status: 500 },
    );
  }

  const v = validated.data.data.values;

  const current = await db8.orm.public.WeatherSnapshot.create({
    id: createId(),
    locationId,
    temperature: v.temperature,
    feelsLike: v.temperatureApparent,
    humidity: v.humidity,
    windSpeed: v.windSpeed,
    windDirection: v.windDirection,
    pressure: v.pressureSurfaceLevel,
    visibility: v.visibility,
    weatherCode: v.weatherCode,
  });

  return NextResponse.json({
    location,
    current,
    forecast: null,
    sources: {
      current: "api",
      forecast: "disabled",
    },
    ages: {
      currentMinutes: currentAge,
      forecastMinutes: null,
    },
  });
}
