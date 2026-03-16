import { queryAxiom } from "@/lib/axiom/query";
import { NextResponse } from "next/server";

export async function GET() {
  const qFlight = `
| where _time > ago(7d)
| sort by _time desc
| take 1
`;

  const qWeather = `
| where _time > ago(7d)
| sort by _time desc
| take 1
`;

  try {
    const flightRows = (await queryAxiom(qFlight, 60, "config")) ?? [];
    const weatherRows = (await queryAxiom(qWeather, 60, "config")) ?? [];

    const statsQuery = `
| summarize count(), last_time=max(_time)
`;
    const statsRows = (await queryAxiom(statsQuery, 60, "config")) ?? [];
    const stats: any = statsRows[0] ?? { count: 0, last_time: null };

    return NextResponse.json({
      flight: flightRows[0] ?? null,
      weather: weatherRows[0] ?? null,
      stats: {
        count: Number(stats.count ?? stats["count()"] ?? 0),
        lastTime: stats.last_time ?? stats.last_time_ ?? null,
      },
    });
  } catch (error) {
    console.error("/api/config/read error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
