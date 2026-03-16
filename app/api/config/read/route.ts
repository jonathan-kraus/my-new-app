import { queryAxiom } from "@/lib/axiom/query";
import { NextResponse } from "next/server";

export async function GET() {
	const qFlight = `
| where _time > ago(7d)
| where reason == "Flight"
| sort by _time desc
| take 1
`;

	const qWeather = `
| where _time > ago(7d)
| where reason == "Weather"
| sort by _time desc
| take 1
`;

	try {
		const flightRows = (await queryAxiom(qFlight, 60)) ?? [];
		const weatherRows = (await queryAxiom(qWeather, 60)) ?? [];

		return NextResponse.json({
			flight: flightRows[0] ?? null,
			weather: weatherRows[0] ?? null,
		});
	} catch (error) {
		console.error("/api/config/read error", error);
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
