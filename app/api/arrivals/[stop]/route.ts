/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 20:18:36
 */
import { mbta } from "@/lib/mbta";
import { NextResponse } from "next/server";
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
    line: 16,
    payload: {
      URL: req.url,
      params: params,
      method: req.method,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const data = await mbta("predictions", {
    "filter[stop]": params.stop,
    "filter[route]": "Green-C",
    include: "trip,vehicle",
  });

  // 1. Must have arrival or departure time
  const withTimes = data.data.filter(
    (p: any) => p.attributes.arrival_time || p.attributes.departure_time,
  );

  // 2. If trip exists, it must be Green-C
  const withCorrectTrip = withTimes.filter((p: any) => {
    const tripId = p.relationships.trip?.data?.id;
    if (!tripId) return true; // allow predictions without trip
    const trip = data.included?.find(
      (inc: any) => inc.type === "trip" && inc.id === tripId,
    );
    return !trip || trip.attributes.route_id === "Green-C";
  });

  // 3. If vehicle exists, it must be Green-C
  const withCorrectVehicle = withCorrectTrip.filter((p: any) => {
    const vehicleId = p.relationships.vehicle?.data?.id;
    if (!vehicleId) return true; // allow predictions without vehicle
    const vehicle = data.included?.find(
      (inc: any) => inc.type === "vehicle" && inc.id === vehicleId,
    );
    return !vehicle || vehicle.attributes.route_id === "Green-C";
  });

  // 4. Done — do NOT filter stop_sequence
  const filtered = withCorrectVehicle; // or whatever your final variable is

  return NextResponse.json({
    stop: params.stop,
    predictions: filtered,
  });
}
