import { NextRequest, NextResponse } from "next/server";
import { refreshLogRowEstimateForToday } from "@/lib/db/refreshLogRowEstimateForToday";
import { logit } from "@/lib/log/logit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await logit(
      "jonathan",
      {
        level: "info",
        message: "cron.refreshLogs.started",
        payload: { trigger: "manual or scheduled" },
      },
      { requestId: "rid", route: "cron/refreshLogs", userId: "JK" },
    );

    await refreshLogRowEstimateForToday();

    await logit(
      "jonathan",
      {
        level: "info",
        message: "cron.refreshLogs.completed",
      },
      { requestId: "rid", route: "cron/refreshLogs", userId: "JK" },
    );

    return NextResponse.json({
      ok: true,
      message: "refreshLogRowEstimateForToday executed",
    });
  } catch (error: any) {
    console.error("Error executing refreshLogs cron:", error);

    await logit(
      "jonathan",
      {
        level: "error",
        message: "cron.refreshLogs.error",
        payload: { error: String(error?.message || error) },
      },
      { requestId: "rid", route: "cron/refreshLogs", userId: "JK" },
    );

    return NextResponse.json(
      { ok: false, error: "Error executing refreshLogRowEstimateForToday" },
      { status: 500 },
    );
  }
}
