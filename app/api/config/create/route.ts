/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-15 20:27:36
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json();
	const dataset = body.dataset ?? process.env.AXIOM_DATASET;
	const events = Array.isArray(body.events) ? body.events : [body];

	try {
		const response = await axiomIngest(events, dataset);
		console.log("AXIOM INGEST RESPONSE", response);
		return NextResponse.json({ ok: true, dataset, count: events.length });
	} catch (error) {
		console.error("axiom ingestion failed", error);
		return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
	}
}
