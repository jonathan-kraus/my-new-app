// app/api/log/route.ts - FULL CONTEXT
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
	try {
		const msg = await req.json();
		const session = await getServerSession(authOptions);

		// ✅ Extract IP from headers (Vercel/Cloudflare/Standard)
		const ipAddress =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("cf-connecting-ip") ||
			req.headers.get("x-real-ip") ||
			req.ip ||
			"unknown";

		const logData = {
			...(typeof msg.data === "object" && msg.data !== null ? msg.data : {}),
			userAgent: req.headers.get("user-agent") || "unknown",
			sessionUser: session?.user?.name || null,
			sessionEmail: session?.user?.email || null,
			sessionId: session?.session?.id || null, // ✅ Session ID
			ipAddress: ipAddress, // ✅ Client IP
		};

		await db.log.create({
			data: {
				level: msg.level,
				message: msg.message,
				data: Object.keys(logData).length > 0 ? logData : null,
				userId: session?.user?.name || msg.userId || "anonymous",
				page: msg.page || req.nextUrl.pathname,
				sessionId: session?.session?.id || null, // ✅ Column 1
				ipAddress: ipAddress, // ✅ Column 2
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Log API error:", error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
