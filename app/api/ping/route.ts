// app/api/ping/route.ts - SIMPLE TEST
import { appLog } from "@/lib/logger";
import { NextResponse } from "next/server";
console.log("PING route loaded");
//

export function GET() {
	return NextResponse.json({
		db: process.env.DATABASE_URL ?? "missing",
	});
}
export async function log() {
	appLog({ level: "info", message: "ping", page: "init" });
	return NextResponse.json({ message: "API works!" });
}
log(); // Simple ping route to test if API is working
