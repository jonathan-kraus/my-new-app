import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Basic IP extraction (safe everywhere)
		const ipAddress =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("cf-connecting-ip") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		const userAgent = req.headers.get("user-agent") || "unknown";

		// Build the log entry with ONLY fields that exist
		const logData = {
			level: body.level || "info",
			message: body.message || "",
			data: body.data || null,
			createdAt: new Date(),
			userId: body.userId || null,
			page: body.page || null,
			userAgent,
			ipAddress,
		};

		await db.log.create({ data: logData });

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Log API error:", err);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
