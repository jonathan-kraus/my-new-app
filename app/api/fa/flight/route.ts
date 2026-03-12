import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/runtime/config";

export async function GET(request: NextRequest) {
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

  //
  // 2. Helper: detect active flights
  //
  function isActive(f: any) {
    const s = (f.status ?? "").toLowerCase();

    return (
      s.includes("en route") ||
      s.includes("enroute") ||
      s.includes("airborne") ||
      s.includes("departed") ||
      f.actual_off != null ||
      (typeof f.progress_percent === "number" && f.progress_percent > 0)
    );
  }

  //
  // 3. Helper: detect today's flight in origin's local timezone
  //
  function isTodayLocal(flight: any) {
    const tz = flight.origin?.timezone;
    if (!tz || !flight.scheduled_out) return false;

    const localDate = new Date(flight.scheduled_out).toLocaleDateString("en-US", {
      timeZone: tz,
    });

    const todayLocal = new Date().toLocaleDateString("en-US", {
      timeZone: tz,
    });

    return localDate === todayLocal;
  }

  //
  // 4. Fetch track for each flight (in parallel)
  //
  async function getTrack(flightId: string) {
    const res = await fetch(
      `https://aeroapi.flightaware.com/aeroapi/flights/${flightId}/track`,
      { headers }
    );
    const text = await res.text();
    console.log("FA TRACK RESPONSE:", text);

    try {
      const json = JSON.parse(text);
      return json.positions ?? [];
    } catch {
      return [];
    }
  }

  const tracks = await Promise.all(
    flights.map((f: any) => getTrack(f.fa_flight_id))
  );

  //
  // 5. Pick the flight with the freshest telemetry
  //
  let bestIndex = 0;
  let bestTimestamp = 0;

  tracks.forEach((positions, i) => {
    const last = positions[positions.length - 1];
    if (last && last.timestamp > bestTimestamp) {
      bestTimestamp = last.timestamp;
      bestIndex = i;
    }
  });

  const freshestFlight = flights[bestIndex];
  const freshestTrack = tracks[bestIndex];
  const freshestLive = freshestTrack[freshestTrack.length - 1] ?? null;

  //
  // 6. Fallback logic (metadata-based)
  //
  const active = flights.find(isActive);
  const todayFlight = flights.find(isTodayLocal);
  const nextScheduled = flights[0];

  // Final selection: telemetry freshness wins
  const flight = freshestFlight ?? active ?? todayFlight ?? nextScheduled;
  const live = freshestLive;

  //
  // 7. Return merged data
  //
  return NextResponse.json({
    ident,
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
  });
}
