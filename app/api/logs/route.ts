// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? 0);
  const limit = 80;
  const skip = page * limit;

  const where = search
    ? {
        OR: [
          { message: { contains: search } },
          { level: { contains: search } },
          { file: { contains: search } },
          { requestId: { contains: search } },
        ],
      }
    : undefined;

  const logs = await db.log.findMany({
    where,
    orderBy: { created_at: "desc" },
    skip,
    take: limit,
  });

  return NextResponse.json({ logs });
}
