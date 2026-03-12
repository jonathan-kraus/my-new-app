import { getConfig } from "@/lib/runtime/config";
import { NextRequest, NextResponse } from "next/server";


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

  // --- Fetch metadata ---
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

  // --- Fetch track ---
  const trackRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}/track`,
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

  return NextResponse.json({
    ident,
    scheduled_out: metaData?.flights?.[0]?.scheduled_out ?? null,
    estimated_out: metaData?.flights?.[0]?.estimated_out ?? null,
    scheduled_in: metaData?.flights?.[0]?.scheduled_in ?? null,
    estimated_in: metaData?.flights?.[0]?.estimated_in ?? null,
    status: metaData?.flights?.[0]?.status ?? "Unknown",
    gate_out: metaData?.flights?.[0]?.gate_out ?? null,
    gate_in: metaData?.flights?.[0]?.gate_in ?? null,
    aircraft_type: metaData?.flights?.[0]?.aircraft_type ?? null,
    origin: metaData?.flights?.[0]?.origin ?? null,
    destination: metaData?.flights?.[0]?.destination ?? null,

    live_altitude: live?.altitude ?? null,
    live_groundspeed: live?.groundspeed ?? null,
    live_heading: live?.heading ?? null,
    live_latitude: live?.latitude ?? null,
    live_longitude: live?.longitude ?? null,
    live_timestamp: live?.timestamp ?? null,
  });
}
