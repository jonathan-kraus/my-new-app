/*
 * @FilePath: \my-new-app\app\api\arrivals\[stop]\route.ts
 * @LastEditTime: 2026-08-23 20:02:55
 */
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

  // 1. Only predictions with valid arrival/departure times
  const withTimes = data.data.filter(
    (p: any) => p.attributes.arrival_time || p.attributes.departure_time,
  );

  // 2. Only predictions whose trip is actually a Green-C trip
  const withCorrectTrip = withTimes.filter((p: any) => {
    const trip = data.included?.find(
      (inc: { type: string; id: string }) =>
        inc.type === "trip" && inc.id === p.relationships.trip?.data?.id,
    );

    if (!trip) return false;

    // MBTA uses patterns like "Green-C-1", "Green-C-2", etc.
    return trip.attributes.route_id === "Green-C";
  });

  // 3. Only predictions whose vehicle is assigned to a Green-C trip
  const withCorrectVehicle = withCorrectTrip.filter((p: any) => {
    const vehicle = data.included?.find(
      (inc: { type: string; id: string }) =>
        inc.type === "vehicle" && inc.id === p.relationships.vehicle?.data?.id,
    );

    if (!vehicle) return true; // some predictions have no vehicle yet

    return vehicle.attributes.route_id === "Green-C";
  });

  // 4. Only predictions whose stop_sequence is valid for Green-C
  const final = withCorrectVehicle.filter((p: any) => {
    const trip = data.included?.find(
      (inc: { type: string; id: string }) =>
        inc.type === "trip" && inc.id === p.relationships.trip?.data?.id,
    );

    if (!trip) return false;

    const seq = p.attributes.stop_sequence;
    const pattern = trip.attributes.direction_id; // 0 = outbound, 1 = inbound

    // Green-C inbound sequences are always increasing toward Government Center
    // Green-C outbound sequences are always increasing toward Cleveland Circle
    return typeof seq === "number" && seq >= 0 && seq <= 50;
  });

  return final;

  //return Response.json(data);
}
