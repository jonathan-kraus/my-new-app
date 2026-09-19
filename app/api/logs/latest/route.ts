// app/api/logs/latest/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { or } from "@prisma/orm-postgres/orm-client";
import { timestampString } from "@/lib/timestampString";
import { logFromClient } from "@/app/actions/log";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const since = req.nextUrl.searchParams.get("since");
    const search = req.nextUrl.searchParams.get("q") ?? "";

    let query = db8.orm.public.Log;

    if (since) {
      const cutoff = timestampString(new Date(since).toISOString());
      query = query.where((log) => log.createdAt.gt(cutoff));
    }

    if (search) {
      const pattern = `%${search}%`;
      query = query.where((log) =>
        or(
          log.message.like(pattern),
          log.level.like(pattern),
          log.file.like(pattern),
          log.requestId.like(pattern),
        ),
      );
    }

    const logs = await query
      .orderBy((log) => log.createdAt.desc())
      .limit(75)
      .all();

    return NextResponse.json({
      logs: logs.map(({ createdAt, ...log }) => ({
        ...log,
        created_at: new Date(`${createdAt}Z`).toISOString(),
      })),
    });
  } catch (err: unknown) {
    try {
      const result = await logFromClient(
        "logs",
        "Failed to fetch latest logs",
        "app/api/logs/latest/route.ts",
        45,
        { error: err instanceof Error ? err.message : String(err) },
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
