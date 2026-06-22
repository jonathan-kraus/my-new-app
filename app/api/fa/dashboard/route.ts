/*
 * @FilePath: \my-new-app\app\api\fa\dashboard\route.ts
 * @LastEditTime: 2026-06-22 00:57:36
 */
// app/api/fa/dashboard/route.ts
import { getConfig } from "@/lib/runtime/config";
import { NextResponse } from "next/server";
import { toZonedTime, format } from "date-fns-tz";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

type Flight = {
  scheduled_out?: string | null;
};
const built = staticUniversalContext("DB");
let jei = 0;
export async function GET() {
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Loading FA dashboard route",
    file: "app/api/fa/dashboard/route.ts",
    line: 19,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // 1. Fetch flight count
  const minLat = await getConfig("minLat", "40.0893");
  const minLon = await getConfig("minLon", "-105.7435");
  const maxLat = await getConfig("maxLat", "40.7142");
  const maxLon = await getConfig("maxLon", "-104.9679");
  console.log("BOUNDING BOX", { minLat, minLon, maxLat, maxLon });

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
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Completed FA dashboard route",
    file: "app/api/fa/dashboard/route.ts",
    line: 47,
    payload: {
      countData: countData,
      minLat: minLat,
      minLon: minLon,
      maxLat: maxLat,
      maxLon: maxLon,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // 1b. Fetch actual planes in the skybox
  const planesRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/search?query=${encodeURIComponent(
      query,
    )}`,
    {
      headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY! },
    },
  );

  const planesData = await planesRes.json();
  console.log("PLANE DATA", planesData);

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

  const eastern = "America/New_York";

  const today = format(toZonedTime(new Date(), eastern), "yyyy-MM-dd");

  const current = statusData.flights.find((f: Flight) => {
    const sched = f.scheduled_out?.slice(0, 10);
    return sched === today;
  });

  return NextResponse.json({
    count: countData.count,
    flight: current ?? null,
    planes: planesData.flights ?? [],
  });
}
