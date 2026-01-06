// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { ForecastResponseSchema } from "@/lib/weather/zodschema";

export async function GET(req: Request) {
  await logit({
    level: "info",
    message: "Weather forecast initiated",
    file: "app/api/weather/forecast/route.ts",
    line: 8,
    data: { initTime: Date.now() },
  });

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

  // Example: Open‑Meteo (no API key required)
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
      message: "Invalid weather API response",
      page: "/api/weather/forecast",
      data: parsed.error.flatten(),
    });
    return NextResponse.json(
      { error: "Weather data unavailable" },
      { status: 502 },
    );
  }
  const weather = parsed.data;

  await logit({
    level: "info",
    message: "Weather API request completed",
    file: "app/api/weather/forecast/route.ts",
    line: 57,
    data: { status: weatherRes.status, parsed: parsed },
  });

  await logit({
    level: "info",
    message: "Retrieved forecast",
    page: "/forecast",
    data: { status: "ok", time: Date.now() },
    file: "app/api/weather/forecast/route.ts",
    line: 65,
  });

  return NextResponse.json({
    location,
    current: weather.current_weather,
    forecast: weather.daily,
  });
}
