// /api/config/read/route.ts
import { queryAxiom } from "@/lib/axiom/query";
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
export async function GET() {
  const built = staticUniversalContext("Config");
  let jei = 0;
  try {
    // Queries
    const qFlight = `
["config"]
| where reason == "Flight"
| sort by _time desc
| take 1
`;
    await logj({
      domain: "config",
      level: "info",
      message: "Config page loaded",
      file: "api/config/read/route.ts",
      line: 17,
      payload: { qflight: qFlight },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const qWeather = `
["config"]
| where reason == "Weather"
| sort by _time desc
| take 1
`;

    // Fetch rows
    const flightRows = (await queryAxiom(qFlight)) ?? [];
    const weatherRows = (await queryAxiom(qWeather)) ?? [];

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
