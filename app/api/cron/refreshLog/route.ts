// app/api/cron/refreshLog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runDbTableStats } from "@/lib/cron/runDbTableStats";
import { logit } from "@/lib/log/logit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    await logit(
      "jonathan",
      {
        level: "info",
        message: "cron.dbTableStats.started",
      },
      { requestId, route: "cron/dbTableStats", userId: "JK" },
    );

    await runDbTableStats({
      requestId,
      route: "cron/dbTableStats",
      userId: "JK",
    });

    await logit(
      "jonathan",
      {
        level: "info",
        message: "cron.dbTableStats.completed",
      },
      { requestId, route: "cron/dbTableStats", userId: "JK" },
    );

    return NextResponse.json({
      ok: true,
      executedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    await logit(
      "jonathan",
      {
        level: "error",
        message: "cron.dbTableStats.error",
        payload: { error: String(error?.message || error) },
      },
      { requestId, route: "cron/dbTableStats", userId: "JK" },
    );

    return NextResponse.json(
      { ok: false, error: "Error executing runDbTableStats" },
      { status: 500 },
    );
  }
}
