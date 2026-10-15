import type { Flight, FlightPosition } from "@/lib/flight/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getConfig } from "@/lib/runtime/config";
import {
  selectFlight,
  latestPosition,
  isFreshPosition,
  isAirborne,
} from "@/lib/flight/selection";
import { detectFlightPhase } from "@/lib/flight/phase";

export async function GET(_request: NextRequest) {
  const flightId = _request.nextUrl.searchParams.get("flightId");
  if (flightId && !/^[a-zA-Z0-9_-]{1,200}$/.test(flightId)) {
    return NextResponse.json({ error: "Invalid flight ID" }, { status: 400 });
  }
  const identRaw = await getConfig("flight-ID", "ident");
  const identStr = identRaw != null ? String(identRaw) : "";
  const identUpper = identStr.toUpperCase();

  // Convert AA#### → AAL####
  let ident = identUpper;
  if (/^AA\d+$/.test(identUpper)) {
    ident = "AAL" + identUpper.slice(2);
  }

  const headers = {
    "x-apikey": process.env.FLIGHTAWARE_API_KEY!,
  };

  //
  // 1. Fetch metadata for the ident
  //
  const metaRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(flightId ?? ident)}`,
    { headers, cache: "no-store" },
  );

  if (!metaRes.ok)
    return NextResponse.json(
      { error: "FlightAware lookup failed" },
      { status: 502 },
    );
  const metaText = await metaRes.text();
  console.log("FA META RESPONSE:", metaText);

  let metaData: { flights?: Flight[] } | null = null;
  try {
    metaData = JSON.parse(metaText);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from FlightAware META" },
      { status: 502 },
    );
  }

  const flights = metaData?.flights ?? [];
  if (flights.length === 0) {
    return NextResponse.json(
      { error: "No flights found for ident" },
      { status: 404 },
    );
  }

  const flight = flightId
    ? flights.find((candidate) => candidate.fa_flight_id === flightId)
    : selectFlight(flights);
  if (!flight)
    return NextResponse.json({ error: "No flight found" }, { status: 404 });

  // Fetch only the selected occurrence; do not mix its metadata with another track.
  let positions: FlightPosition[] = [];
  try {
    const trackRes = await fetch(
      `https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(flight.fa_flight_id)}/track`,
      { headers, cache: "no-store" },
    );
    if (trackRes.ok) {
      const track = await trackRes.json();
      positions = Array.isArray(track.positions) ? track.positions : [];
    }
  } catch {
    // Last reported position remains useful when track service is unavailable.
  }
  const latest = latestPosition([
    ...positions,
    ...(flight.last_position ? [flight.last_position] : []),
  ]);
  const live =
    latest && isFreshPosition(latest) && isAirborne(flight) ? latest : null;
  const phase = detectFlightPhase(live);

  //
  // 7. Return merged data
  //
  return NextResponse.json({
    ident: flight.ident,
    fa_flight_id: flight.fa_flight_id,

    scheduled_out: flight.scheduled_out ?? null,
    estimated_out: flight.estimated_out ?? null,
    actual_out: flight.actual_out ?? null,

    scheduled_off: flight.scheduled_off ?? null,
    estimated_off: flight.estimated_off ?? null,
    actual_off: flight.actual_off ?? null,

    scheduled_on: flight.scheduled_on ?? null,
    estimated_on: flight.estimated_on ?? null,
    actual_on: flight.actual_on ?? null,

    scheduled_in: flight.scheduled_in ?? null,
    estimated_in: flight.estimated_in ?? null,
    actual_in: flight.actual_in ?? null,

    status: flight.status ?? "Unknown",
    aircraft_type: flight.aircraft_type ?? null,
    origin: flight.origin ?? null,
    destination: flight.destination ?? null,
    gate_origin: flight.gate_origin ?? null,
    gate_destination: flight.gate_destination ?? null,

    // Live telemetry (altitude in *feet*)
    live_altitude: live ? live.altitude * 100 : null,
    live_groundspeed: live?.groundspeed ?? null,
    live_heading: live?.heading ?? null,
    live_latitude: live?.latitude ?? null,
    live_longitude: live?.longitude ?? null,
    live_timestamp: live?.timestamp ?? null,

    phase,
  });
}
