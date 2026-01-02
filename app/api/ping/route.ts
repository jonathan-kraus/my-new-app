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
export function Log() {

	//fetch("/api/ping");
const level = 1;
	 appLog({ level: "info", message: "ping", page: "init" });
	return (level);


}
