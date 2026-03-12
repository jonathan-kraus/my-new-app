import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/runtime/config";

export async function GET(request: NextRequest) {
  // 1. Load ident from config
  const identRaw = await getConfig("flight-ID", "ident");

  // Safely convert runtime value → string
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
  // 2. Fetch metadata for the ident
  //
  const metaRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}`,
    { headers }
  );

  const metaText = await metaRes.text();
  console.log("FA META RESPONSE:", metaText);

  let metaData: any = null;
  try {
    metaData = JSON.parse(metaText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON from FlightAware META" });
  }

  const flights = metaData?.flights ?? [];
  if (flights.length === 0) {
    return NextResponse.json({ error: "No flights found for ident" });
  }

  // Pick the first flight (today’s or next upcoming)
  const flight = flights[0];

  // Extract the REAL flight ID for track lookup
  const flightId = flight.fa_flight_id;
  if (!flightId) {
    return NextResponse.json({ error: "No fa_flight_id available" });
  }

  //
  // 3. Fetch track using the REAL flight ID
  //
  const trackRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${flightId}/track`,
    { headers }
  );

  const trackText = await trackRes.text();
  console.log("FA TRACK RESPONSE:", trackText);

  let trackData: any = null;
  try {
    trackData = JSON.parse(trackText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON from FlightAware TRACK" });
  }

  const positions = trackData?.positions ?? [];
  const live = positions.length > 0 ? positions[positions.length - 1] : null;

  //
  // 4. Return merged data
  //
  return NextResponse.json({
    ident,
    fa_flight_id: flightId,

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

    // Live telemetry
    live_altitude: live?.altitude ?? null,
    live_groundspeed: live?.groundspeed ?? null,
    live_heading: live?.heading ?? null,
    live_latitude: live?.latitude ?? null,
    live_longitude: live?.longitude ?? null,
    live_timestamp: live?.timestamp ?? null,
  });
}
