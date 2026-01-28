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
      where.createdAt = { gt: new Date(since) };
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
      where,
      orderBy: { created_at: "desc" },
      take: 75,
    });

    return NextResponse.json({
      logs: logs.map((l) => ({ ...l, created_at: l.created_at.toISOString() })),
    });
  } catch (err: any) {
    try {
      const result = await logFromClient("jonathan", {
        level: "info",
        message: "in log latest",
      });
      console.log("logFromClient result:", result);
    } catch (err) {
      console.error("logFromClient failed:", err);
    }
    // await logit({
    //   level: "error",
    //   message: "Failed to fetch latest logs",
    //   file: "app/api/logs/latest/route.ts",
    //   data: { error: err.message },
    // });

    return NextResponse.json(
      { logs: [], error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
