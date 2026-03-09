/*
 * @FilePath: \my-new-app\app\api\fa\dashboard\route.ts
 * @LastEditTime: 2026-03-09 19:16:24
 */
// app/api/fa/dashboard/route.ts
import { getConfig } from "@/lib/runtime/config";
import { NextResponse } from "next/server";
getConfig;
type Flight = {
  scheduled_out?: string | null;
};

export async function GET() {
  // 1. Fetch flight count
  const minLat = await getConfig("minLat", "40.0893");
  const minLon = await getConfig("minLon", "-105.7435");
  const maxLat = await getConfig("maxLat", "40.7142");
  const maxLon = await getConfig("maxLon", "-104.9679");

  const query = `-latlong "${minLat} ${minLon} ${maxLat} ${maxLon}"`;

  const countRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/search/count?query=${encodeURIComponent(
      query,
    )}`,
    {
      headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY! },
    },
  );

  const countData = await countRes.json();

  // 2. Fetch AA877 status
  const ident = await getConfig("flight-ID", "flight-ID");
  const statusRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}`,
    {
      headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY! },
    },
  );

  const statusData = await statusRes.json();

  // 3. Filter to today's flight
  const today = new Date().toISOString().slice(0, 10);

  const current = statusData.flights.find((f: Flight) => {
    const sched = f.scheduled_out?.slice(0, 10);
    return sched === today;
  });

  return NextResponse.json({
    count: countData.count,
    flight: current ?? null,
  });
}
