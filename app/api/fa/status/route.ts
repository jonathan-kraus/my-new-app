/*
 * @FilePath: \my-new-app\app\api\fa\status\route.ts
 * @LastEditTime: 2026-03-09 17:11:09
 */
import { logit } from "@/lib/log/logit";
import { getConfig } from "@/lib/runtime/config";
import { NextResponse } from "next/server";
logit("info", "API FA status route accessed");

export async function GET(req: Request) {
	const ident = getConfig("flight-ID", "flight-ID");
    await logit(
      "jonathan",
      {
        level: "info",
        message: "API FA status route accessed",
        payload: { ident: ident },
      },
      { requestId: "r", route: "p", userId: "u" },
    );
	if (!ident) {
		return NextResponse.json({ error: "Missing ident" }, { status: 400 });
	}

	console.log("FA STATUS QUERY:", ident);

	const res = await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${ident}`, {
		headers: {
			"x-apikey": process.env.FLIGHTAWARE_API_KEY!,
		},
	});

	console.log("FA STATUS RESPONSE:", res.status);

	if (!res.ok) {
		const err = await res.text();
		console.log("FA STATUS ERROR BODY:", err);
		return NextResponse.json({ error: "FlightAware error", status: res.status }, { status: 500 });
	}

	const data = await res.json();
	console.log("FA STATUS DATA:", data);

	return NextResponse.json(data);
}
