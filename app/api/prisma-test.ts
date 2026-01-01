import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
	try {
		const result = await db.$queryRaw`SELECT 1`;
		return NextResponse.json({ success: true, result });
	} catch (error) {
		console.error("Prisma test error:", error);
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
// app/api/prisma-test.ts - SIMPLE TEST
