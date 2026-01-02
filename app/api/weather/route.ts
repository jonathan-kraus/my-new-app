import { db } from "@/lib/db";
import { appLog } from "@/lib/logger";
import { NextResponse } from "next/server";

const CACHE_MINUTES = Number(process.env.WEATHER_CACHE_MINUTES ?? 10);
const API_KEY = process.env.TOMORROWIO_APIKEY!;

export async function GET() {
  const location = await db.location.findUnique({
    where: { key: "KOP" },
  });

  if (!location) {
    await appLog({
      level: "error",
      message: "Location not found",
      page: "/forecast",
    });
    return NextResponse.json({ error: "Location missing" }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - CACHE_MINUTES * 60_000);

  const cached = await db.weatherSnapshot.findFirst({
    where: {
      locationId: location.id,
      fetchedAt: { gte: cutoff },
    },
    orderBy: { fetchedAt: "desc" },
  });

  if (cached) {
    await appLog({
      level: "info",
      message: "Weather cache hit",
      page: "/forecast",
      data: { fetchedAt: cached.fetchedAt },
    });

    return NextResponse.json({ source: "cache", data: cached });
  }

  await appLog({
    level: "info",
    message: "Weather cache miss — calling Tomorrow.io",
    page: "/forecast",
  });

  const res = await fetch(
    `https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
    { headers: { accept: "application/json" } }
  );

  if (!res.ok) {
    await appLog({
      level: "error",
      message: "Tomorrow.io weather fetch failed",
      page: "/forecast",
      data: { status: res.status },
    });
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 500 });
  }

  const json = await res.json();
  const v = json.data.values;

  const snapshot = await db.weatherSnapshot.create({
    data: {
      locationId: location.id,
      temperature: v.temperature,
      feelsLike: v.temperatureApparent,
      humidity: v.humidity,
      windSpeed: v.windSpeed,
      windDirection: v.windDirection,
      pressure: v.pressureSurfaceLevel,
      visibility: v.visibility,
      weatherCode: v.weatherCode,
    },
  });

  await appLog({
    level: "info",
    message: "Weather snapshot stored",
    page: "/forecast",
    data: snapshot,
  });

  return NextResponse.json({ source: "api", data: snapshot });
}

