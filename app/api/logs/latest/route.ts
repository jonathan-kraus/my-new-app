// app/api/logs/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // or your prisma import
import { logit } from "@/lib/log/server";

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

    const logs = await prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Failed to fetch latest logs",
      file: "app/api/logs/latest/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { logs: [], error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
