import { NextResponse } from "next/server";
import { getConfig } from "@/lib/runtime/config";

export async function GET(req: Request, { params }: { params: { ident: string } }) {
  const ident = await getConfig("flight-ID", "ident");
  if (!ident) return NextResponse.json({ error: "Missing ident" }, { status: 400 });
  const headers = { "x-apikey": process.env.FLIGHTAWARE_API_KEY! };

  // Scheduled metadata
  const metaRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}`,
    { headers }
  );
  const metaData = await metaRes.json();
  const meta = metaData.flights?.[0] ?? null;

  // Live telemetry
  const trackRes = await fetch(
    `https://aeroapi.flightaware.com/aeroapi/flights/${ident}/track`,
    { headers }
  );
  const trackData = await trackRes.json();
  const positions = trackData.positions ?? [];
  const live = positions.length > 0 ? positions[positions.length - 1] : null;

  return NextResponse.json({
    ident,
    // Scheduled
    scheduled_out: meta?.scheduled_out ?? null,
    estimated_out: meta?.estimated_out ?? null,
    scheduled_in: meta?.scheduled_in ?? null,
    estimated_in: meta?.estimated_in ?? null,
    status: meta?.status ?? "Unknown",
    gate_out: meta?.gate_out ?? null,
    gate_in: meta?.gate_in ?? null,
    terminal_out: meta?.terminal_out ?? null,
    terminal_in: meta?.terminal_in ?? null,
    delays: meta?.delays ?? null,
    aircraft_type: meta?.aircraft_type ?? null,
    origin: meta?.origin ?? null,
    destination: meta?.destination ?? null,

    // Live
    live_altitude: live?.altitude ?? null,
    live_groundspeed: live?.groundspeed ?? null,
    live_heading: live?.heading ?? null,
    live_latitude: live?.latitude ?? null,
    live_longitude: live?.longitude ?? null,
    live_timestamp: live?.timestamp ?? null,
  });
}
