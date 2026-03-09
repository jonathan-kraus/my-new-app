/*
 * @FilePath: \my-new-app\app\api\fa\count\route.ts
 * @LastEditTime: 2026-03-09 16:32:27
 */
// app/api/fa/count/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { url } from "node:inspector";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const minLat = searchParams.get("minLat");
  const minLon = searchParams.get("minLon");
  const maxLat = searchParams.get("maxLat");
  const maxLon = searchParams.get("maxLon");

      await logit(
        "fa",
        {
          level: "info",
          message: "Missing lat/long parameters",
          payload: { minLat: minLat, minLon: minLon, maxLat: maxLat, maxLon: maxLon, url: req.url },
        },
        {
          requestId: crypto.randomUUID(),
          userId: undefined,
        },
      );

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
