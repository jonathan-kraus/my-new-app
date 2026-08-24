/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-24 17:39:18
 */
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(request: Request) {
  // Extract stop ID directly from the URL
  const { pathname } = new URL(request.url);
  const stopId = pathname.split("/").pop(); // "place-denrd"

  console.log("### ARRIVALS ROUTE ### stopId =", stopId);

  if (!stopId) {
    return Response.json(
      { error: "Missing stop ID" },
      { status: 400 }
    );
  }

  // Build MBTA API request
  const url = new URL("https://api-v3.mbta.com/predictions");
  url.searchParams.set("filter[stop]", stopId);
  url.searchParams.set("include", "trip");
  url.searchParams.set("sort", "arrival_time");

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return Response.json(
      { error: "Failed to fetch MBTA arrivals" },
      { status: res.status }
    );
  }

  const json = await res.json();
  return Response.json(json);
}
