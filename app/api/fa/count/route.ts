/*
 * @FilePath: \my-new-app\app\api\fa\count\route.ts
 * @LastEditTime: 2026-03-09 16:49:49
 */
// app/api/fa/count/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { getConfig } from "@/lib/runtime/config";

export async function GET(req: Request) {
  const minLat = await getConfig("minLat", "40.0893");
  const minLon = await getConfig("minLon", "-105.7435");
  const maxLat = await getConfig("maxLat", "40.7142");
  const maxLon = await getConfig("maxLon", "-104.9679");
  console.log("FA COUNT QUERY:", {
    minLat,
    minLon,
    maxLat,
    maxLon,
    url: req.url,
  });

  await logit("fa", {
        level: "info",
        message: "Missing lat/long parameters",
        minLat: minLat,
        minLon: minLon,
        maxLat: maxLat,
        maxLon: maxLon,
        url: req.url,
      }, { eventIndex }, {
          requestId: crypto.randomUUID(), userId: undefined,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
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
