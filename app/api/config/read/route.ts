// /api/config/read/route.ts
import { queryAxiom } from "@/lib/axiom/query";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const qFlight = `
['config']
| where data.reason == "Flight"
| sort by _time asc
`;

    const qWeather = `
['config']
| where data.reason == "Weather"
| sort by _time asc
`;

    const flightRows  = (await queryAxiom(qFlight, 60, "config")) ?? [];
    const weatherRows = (await queryAxiom(qWeather, 60, "config")) ?? [];

    const flight  = flightRows.at(-1) ?? null;  // latest Flight
    const weather = weatherRows.at(-1) ?? null; // latest Weather

    const statsQuery = `
['config']
| summarize count(), last_time = max(_time)
`;
    const statsRows = (await queryAxiom(statsQuery, 60, "config")) ?? [];
    const statsAny: any = statsRows[0] ?? { count: 0, last_time: null };

    return NextResponse.json({
      flight,
      weather,
      stats: {
        count: Number(statsAny.count ?? statsAny["count()"] ?? 0),
        lastTime: statsAny.last_time ?? null,
      },
    });
  } catch (error) {
    console.error("/api/config/read error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
