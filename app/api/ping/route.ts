// app/api/ping/route.ts - SIMPLE TEST
import { logit } from "@/lib/log/client";
import { NextResponse } from "next/server";

console.log("PING route loaded");
//

import { getUSNOMoonData } from "@/lib/lunar/usno";

export async function GET() {
  // Pick a known location (your default)
  const lat = 40.101; // King of Prussia-ish
  const lon = -75.383;
  const today = new Date();

  const result = await getUSNOMoonData(lat, lon, today);

  return Response.json({
    requestedAt: new Date().toISOString(),
    lat,
    lon,
    today: today.toISOString(),
    result,
  });
}

export function Log() {
  //fetch("/api/ping");
  const level = 1;
  logit({
    level: "info",
    message: "ping",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    line: 16,
  });
  return level;
}
