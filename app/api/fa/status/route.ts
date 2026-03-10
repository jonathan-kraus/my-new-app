/*
 * @FilePath: \my-new-app\app\api\fa\status\route.ts
 * @LastEditTime: 2026-03-09 20:13:16
 */
import { logit } from "@/lib/log/logit";
import { getConfig } from "@/lib/runtime/config";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ident = await getConfig("flight-ID", "flight-ID");
  console.log("FINAL IDENT:", ident);

  await logit(
    "jonathan",
    {
      level: "info",
      message: "API FA status route accessed",
      payload: { ident: ident },
    },
    { requestId: "r", route: "p", userId: "u" },
  );
  if (!ident) {
    return NextResponse.json({ error: "Missing ident" }, { status: 400 });
  }

  console.log("FA STATUS QUERY:", ident);

  const res = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}`,
    {
      headers: {
        "x-apikey": process.env.FLIGHTAWARE_API_KEY!,
      },
    },
  );

  console.log("FA STATUS RESPONSE:", res.status);

  if (!res.ok) {
    const err = await res.text();
    console.log("FA STATUS ERROR BODY:", err);
    return NextResponse.json(
      { error: "FlightAware error", status: res.status },
      { status: 500 },
    );
  }

  const data = await res.json();
  console.log("FA STATUS DATA:", data);
  type Flight = {
    scheduled_out?: string | null;
    // you can add more fields later if needed
  };
  // Filter for today's flight
const today = new Date().toISOString().slice(0, 10);

const todaysFlights = data.flights.filter((f: Flight) => {
  const sched = f.scheduled_out?.slice(0, 10);
  return sched === today;
});

// If multiple flights match today, pick the one closest to now
let current = null;

if (todaysFlights.length > 0) {
  const now = Date.now();

  current = todaysFlights.reduce((closest, flight) => {
    const schedTime = new Date(flight.scheduled_out!).getTime();
    const closestTime = new Date(closest.scheduled_out!).getTime();

    return Math.abs(schedTime - now) < Math.abs(closestTime - now)
      ? flight
      : closest;
  });
}

console.log("CURRENT FLIGHT:", current);

return NextResponse.json({ flight: current });
}
