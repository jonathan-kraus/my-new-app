/*
 * @FilePath: \my-new-app\app\api\weather\detail\route.ts
 * @LastEditTime: 2026-09-12 12:45:39
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

export async function GET(req: NextRequest) {
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

  if (!response.ok) {
    return NextResponse.json(
      { error: "Detailed weather fetch failed" },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as TimelineResponse;
  const intervals = payload.data?.timelines?.[0]?.intervals ?? [];

  if (intervals.length === 0) {
    return NextResponse.json(
      { error: "Detailed weather data was empty" },
      { status: 502 },
    );
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
