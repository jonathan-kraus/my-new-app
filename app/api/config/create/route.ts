/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-23 00:40:00
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";
import { log } from "@/lib/log/logger";
import { setLogFile } from "@/lib/log/set-logfile";

setLogFile("app\api\config\create\route.ts");
export async function POST(request: Request) {
	await log.api("jonathan", "In api\config\create\route.ts");

	const body = await request.json();
	const dataset = body.dataset ?? process.env.AXIOM_DATASET;
	const events = Array.isArray(body.events) ? body.events : [body];

	(await log.api("jonathan", "api/config/ got some data"),
		{
			body: JSON.stringify(body),
			dataset: JSON.stringify(dataset),
			events: JSON.stringify(events),
		});
	try {
		const response = await axiomIngest(events, dataset);
		console.log("AXIOM INGEST RESPONSE", response);
		return NextResponse.json({ ok: true, dataset, count: events.length });
	} catch (error) {
		console.error("axiom ingestion failed", error);
		return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
	}
}
