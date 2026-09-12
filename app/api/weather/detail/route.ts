/*
 * @FilePath: \my-new-app\app\api\weather\detail\route.ts
 * @LastEditTime: 2026-09-12 12:45:39
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logj } from "@/lib/log/logj";

const API_KEY = process.env.TOMORROWIO_APIKEY;

type TimelineInterval = {
  startTime: string;
  values: {
    temperature?: number;
    temperatureApparent?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: number;
    precipitationProbability?: number;
    precipitationIntensity?: number;
    cloudCover?: number;
    weatherCode?: number;
  };
};

type TimelineResponse = {
  data?: {
    timelines?: Array<{
      intervals?: TimelineInterval[];
    }>;
  };
};

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    cloud_cover?: number[];
    weather_code?: number[];
  };
};

async function fetchOpenMeteoHourly(location: {
  latitude: number;
  longitude: number;
}) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "precipitation_probability",
      "precipitation",
      "cloud_cover",
      "weather_code",
    ].join(","),
    forecast_hours: "24",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { cache: "no-store" },
  );
  const payload = (await response.json()) as OpenMeteoResponse;

  const hourly = payload.hourly;
  const times = hourly?.time;
  if (!response.ok || !hourly || !times) {
    throw new Error(`Open-Meteo hourly request failed (${response.status})`);
  }

  return times.map((time, index) => ({
    time,
    temperature: hourly.temperature_2m?.[index],
    temperatureApparent: hourly.apparent_temperature?.[index],
    humidity: hourly.relative_humidity_2m?.[index],
    windSpeed: hourly.wind_speed_10m?.[index],
    windDirection: hourly.wind_direction_10m?.[index],
    precipitationProbability: hourly.precipitation_probability?.[index],
    precipitationIntensity: hourly.precipitation?.[index],
    cloudCover: hourly.cloud_cover?.[index],
    weatherCode: hourly.weather_code?.[index],
  }));
}

export async function GET(req: NextRequest) {
  const built = await buildUniversalContext(req, "WEATHER_DETAIL");
  let eventIndex = 0;
  const locationId = new URL(req.url).searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Tomorrow.io API key is not configured" },
      { status: 503 },
    );
  }

  const location = await db.location.findUnique({ where: { id: locationId } });
  if (!location) {
    return NextResponse.json({ error: "Invalid locationId" }, { status: 404 });
  }

  const params = new URLSearchParams({
    location: `${location.latitude},${location.longitude}`,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timesteps: "1h",
    units: "imperial",
    fields: [
      "temperature",
      "temperatureApparent",
      "humidity",
      "windSpeed",
      "windDirection",
      "precipitationProbability",
      "precipitationIntensity",
      "cloudCover",
      "weatherCode",
    ].join(","),
    apikey: API_KEY,
  });

  const response = await fetch(
    `https://api.tomorrow.io/v4/weather/forecast?${params.toString()}`,
    { cache: "no-store" },
  );

  const responseText = await response.text();
  let payload: TimelineResponse = {};
  try {
    payload = JSON.parse(responseText) as TimelineResponse;
  } catch (error) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Tomorrow.io detail response was not JSON",
      file: "app/api/weather/detail/route.ts",
      line: 148,
      payload: {
        status: response.status,
        error: String(error),
        body: responseText.slice(0, 1000),
      },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });
  }

  if (!response.ok) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Tomorrow.io detail request failed",
      file: "app/api/weather/detail/route.ts",
      line: 166,
      payload: {
        status: response.status,
        body: responseText.slice(0, 1000),
      },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });
    return NextResponse.json(
      { error: "Detailed weather fetch failed" },
      { status: 502 },
    );
  }

  const intervals = payload.data?.timelines?.[0]?.intervals ?? [];

  if (intervals.length === 0) {
    await logj({
      domain: "weather",
      level: "error",
      message: "Tomorrow.io detail response contained no hourly intervals",
      file: "app/api/weather/detail/route.ts",
      line: 187,
      payload: {
        status: response.status,
        body: responseText.slice(0, 1000),
        topLevelKeys: Object.keys(payload),
        timelineCount: payload.data?.timelines?.length ?? 0,
      },
      meta: { built: { ...built, eventIndex: ++eventIndex } },
    });

    try {
      const hourly = await fetchOpenMeteoHourly(location);
      const current = hourly[0];
      if (!current) throw new Error("Open-Meteo returned no hourly intervals");

      await logj({
        domain: "weather",
        level: "warn",
        message: "Using Open-Meteo hourly fallback",
        file: "app/api/weather/detail/route.ts",
        line: 208,
        payload: { locationId, hourlyCount: hourly.length },
        meta: { built: { ...built, eventIndex: ++eventIndex } },
      });

      return NextResponse.json({
        location,
        current,
        hourly,
        fetchedAt: new Date().toISOString(),
        source: "Open-Meteo fallback",
      });
    } catch (error) {
      await logj({
        domain: "weather",
        level: "error",
        message: "Hourly weather fallback failed",
        file: "app/api/weather/detail/route.ts",
        line: 225,
        payload: { locationId, error: String(error) },
        meta: { built: { ...built, eventIndex: ++eventIndex } },
      });
      return NextResponse.json(
        { error: "Detailed weather data was empty" },
        { status: 502 },
      );
    }
  }

  const hourly = intervals.slice(0, 24).map(({ startTime, values }) => ({
    time: startTime,
    ...values,
  }));
  const current = hourly[0];

  return NextResponse.json({
    location,
    current,
    hourly,
    fetchedAt: new Date().toISOString(),
    source: "Tomorrow.io",
  });
}
