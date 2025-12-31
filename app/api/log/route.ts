import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// 1. Get NextAuth JWT (session strategy: "jwt")
		const token = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
		});

		const userId = token?.sub ?? null;
		const sessionEmail = token?.email ?? null;
		const sessionUser = (token as any)?.name ?? null;

		// 2. Basic IP extraction (safe everywhere)
		const ipAddress =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("cf-connecting-ip") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		const userAgent = req.headers.get("user-agent") || "unknown";

		// 3. Build the log entry with ONLY fields that exist in your Prisma model
		const logData = {
			level: body.level || "info",
			message: body.message || "",
			data: body.data || null,
			createdAt: new Date(),
			userId,
			page: body.page || null,
			userAgent,
			ipAddress,
			// Uncomment if you add these to your Prisma model:
			// sessionEmail,
			// sessionUser,
		};

		console.log("Log entry data:", logData);

		await db.log.create({ data: logData });

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Log API error:", err);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
