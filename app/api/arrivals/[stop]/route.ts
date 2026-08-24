/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts

\[stop]\route.ts
 * @LastEditTime: 2026-08-23 21:04:54
 */
import { NextResponse } from "next/server";
import { mbta } from "@/lib/mbta";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";

const built = await staticUniversalContext("arrivals");
let jei = 0;

export async function GET(req: Request, context: any) {
  const ctx = await context;
  const params = await ctx.params;

  logj({
    domain: "arrivals",
    level: "info",
    message: "Arrivals GET started",
    file: "app/api/arrivals/[stop]/route.ts",
    line: 19,
    payload: {
      URL: req.url,
      params,
      method: req.method,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("Arrivals GET started", {
    URL: req.url,
    params,
    method: req.method,
  });
  // Do NOT filter by route at the MBTA level — it hides ADDED / messy trips
  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    include: "trip,vehicle",
  });

  // 1. Must have arrival or departure time
  const withTimes = data.data.filter(
    (p: any) => p.attributes.arrival_time || p.attributes.departure_time,
  );

  // 2. Keep only Green‑C, but be tolerant of missing / messy metadata
  const onlyGreenC = withTimes.filter((p: any) => {
    // a) Prediction-level route relationship
    const routeRelId = p.relationships.route?.data?.id;
    if (routeRelId && routeRelId !== "Green-C") {
      return false;
    }

    // b) Trip-level route_id (if included)
    const tripId = p.relationships.trip?.data?.id;
    if (tripId) {
      const trip = data.included?.find(
        (inc: any) => inc.type === "trip" && inc.id === tripId,
      );
      const tripRouteId = trip?.attributes?.route_id;
      if (tripRouteId && tripRouteId !== "Green-C") {
        return false;
      }
    }

    // c) Vehicle-level route_id (if included)
    const vehicleId = p.relationships.vehicle?.data?.id;
    if (vehicleId) {
      const vehicle = data.included?.find(
        (inc: any) => inc.type === "vehicle" && inc.id === vehicleId,
      );
      const vehicleRouteId = vehicle?.attributes?.route_id;
      if (vehicleRouteId && vehicleRouteId !== "Green-C") {
        return false;
      }
    }

    // If nothing contradicts Green‑C, keep it
    return true;
  });

  // 3. Do NOT filter stop_sequence — Green Line surface stops use weird values (e.g., 420)
  const filtered = onlyGreenC;

  logj({
    domain: "arrivals",
    level: "info",
    message: "Arrivals GET completed",
    file: "app/api/arrivals/[stop]/route.ts",
    line: 83,
    payload: {
      stop: params.stop,
      total: data.data.length,
      kept: filtered.length,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return NextResponse.json({
    stop: params.stop,
    predictions: filtered,
  });
}
