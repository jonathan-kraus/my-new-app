// /api/config/read/route.ts
import { queryAxiom } from "@/lib/axiom/query";
import { NextResponse } from "next/server";
import { staticUniversalContext } from '@/lib/log/buildj';

export async function GET() {
  try {
    // Queries
    const qFlight = `
["config"]
| where reason == "Flight"
| sort by _time asc
`;

    const qWeather = `
["config"]
| where reason == "Weather"
| sort by _time asc
`;
const built = staticUniversalContext("CONFIG");
    // Fetch rows
    const flightRows = (await queryAxiom(qFlight)) ?? [];
    const weatherRows = (await queryAxiom(qWeather)) ?? [];

    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        domain: "jonathan",
        message: `reading config with ${flightRows.length} flight rows and ${weatherRows.length} weather rows`,
        file: "app/components/SideNavClient.tsx",
        line: 25,
        level: "info",
        payload: { flightRows: flightRows.length, weatherRows: weatherRows.length },
        meta: { built },
      }),
    });
    // Latest entries
    const flight = flightRows.at(-1) ?? null;
    const weather = weatherRows.at(-1) ?? null;

    // Stats (computed locally)
    const stats = {
      total: flightRows.length + weatherRows.length,
      flights: flightRows.length,
      weather: weatherRows.length,
      lastUpdated: (() => {
        const times = [flight?._time, weather?._time].filter(Boolean);

        return times.length ? times.sort().at(-1) : null;
      })(),
    };

    return NextResponse.json({
      flight,
      weather,
      stats,
    });
  } catch (error) {
    console.error("/api/config/read error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
