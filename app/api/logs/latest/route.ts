// app/api/logs/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // or your prisma import
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

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

    return NextResponse.json({ logs });
  } catch (err: any) {
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
