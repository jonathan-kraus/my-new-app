// app/api/ping/route.ts - SIMPLE TEST
import { logit } from "@/lib/log/client";
import { NextResponse } from "next/server";

console.log("PING route loaded");
//


 import { getIPGeoAstronomy } from "@/lib/lunar/ipgeo";

export async function GET() {
  const lat = 40.101;
  const lon = -75.383;
  const today = new Date();

  const result = await getIPGeoAstronomy(lat, lon, today);

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
