// app/api/weather/forecast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";


export async function GET(req: Request) {
  await logit({
  level: "info",
  message: "Weather forecast initiated",
  file: "app/api/weather/forecast/route.ts",
  line: 7,
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
    `&timezone=auto`
);


  const weather = await weatherRes.json();

  await logit({
    level: "info",
    message: "Retrieved forecast",
    page: "/forecast",
    data: { location: location.name },
    file: "app/api/weather/forecast/route.ts",
    line: 29,
  });

  return NextResponse.json({
    location,
    forecast: weather.daily,
  });
}
