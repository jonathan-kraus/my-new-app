// app/api/logs/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // or your prisma import
import { logFromClient } from "@/app/actions/log";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const since = req.nextUrl.searchParams.get("since");
    const search = req.nextUrl.searchParams.get("q") ?? "";

    const where: any = {};

    if (since) {
      where.created_at = { gt: new Date(since) };
    }

    if (search) {
      where.OR = [
        { message: { contains: search } },
        { level: { contains: search } },
        { file: { contains: search } },
        { requestId: { contains: search } },
      ];
    }

    const logs = await db.log.findMany({
      where: {
        NOT: {
          message: {
            startsWith: "#1 REQUEST END",
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 75,
    });

    return NextResponse.json({
      logs: logs.map((l) => ({ ...l, created_at: l.created_at.toISOString() })),
    });
  } catch (err: any) {
    try {
      const result = await logFromClient(
        "logs",
        "Failed to fetch latest logs",
        "app/api/logs/latest/route.ts",
        45,
        { error: err.message },
      );
      console.log("logFromClient result:", result);
    } catch (err) {
      console.error("logFromClient failed:", err);
    }

    return NextResponse.json(
      { logs: [], error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
