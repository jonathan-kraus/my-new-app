// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";

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

  return NextResponse.json({
    logs: logs.map((l) => ({
      ...l,
      created_at: l.created_at.toISOString(), // ← FIX
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, payload, meta } = body ?? {};

    // Use server-side logit to write to DB & queue
    await logit(domain ?? "client", payload ?? {}, meta ?? {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error processing client log", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
