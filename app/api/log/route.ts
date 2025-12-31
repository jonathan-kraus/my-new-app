// app/api/log/route.ts - PROCESSES EVERYTHING
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
	try {
		const msg = (await req.json()) as any;

		// ✅ Server gets REAL data
		const session = await getServerSession(authOptions);
		const userAgent = req.headers.get("user-agent") || "unknown";

		await db.log.create({
			data: {
				level: msg.level,
				message: msg.message,
				data: msg.data ?? Prisma.JsonNull,
				userId: session?.user?.name || msg.userId || "anonymous",
				page: msg.page || req.nextUrl.pathname,
				userAgent,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DB Log error:", error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
