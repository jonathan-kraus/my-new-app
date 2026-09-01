/*
 * @FilePath: \my-new-app\app\api\fa\count\route.ts
 * @LastEditTime: 2026-06-21 23:54:11
 */
// app/api/fa/count/route.ts
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { getConfig } from "@/lib/runtime/config";

export async function GET(req: Request) {
  const built = await buildUniversalContext(req as any, "fa-count");
  let jei = 0;
  const minLat = await getConfig("minLat", "40.0893");
  const minLon = await getConfig("minLon", "-105.7435");
  const maxLat = await getConfig("maxLat", "40.7142");
  const maxLon = await getConfig("maxLon", "-104.9679");
  console.log("FlightAware COUNT QUERY:", {
    minLat,
    minLon,
    maxLat,
    maxLon,
    url: req.url,
  });

  await logj({
    domain: "fa",
    level: "info",
    message: "Missing lat/long parameters",
    file: "app/api/fa/count/route.ts",
    line: 26,
    payload: {
      minLat,
      minLon,
      maxLat,
      maxLon,
      url: req.url,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  if (!minLat || !minLon || !maxLat || !maxLon) {
    return NextResponse.json(
      { error: "Missing lat/long parameters" },
      { status: 400 },
    );
  }

  const query = `-latlong "${minLat} ${minLon} ${maxLat} ${maxLon}"`;

  const res = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/search/count?query=${encodeURIComponent(
      query,
    )}`,
    {
      headers: {
        "x-apikey": process.env.FLIGHTAWARE_API_KEY!,
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "FlightAware error", status: res.status },
      { status: 500 },
    );
  }

  const data = await res.json();
  return NextResponse.json({ count: data.count });
}
