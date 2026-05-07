// app/api/cron/refreshLog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runDbTableStats } from "@/lib/cron/runDbTableStats";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const built = await buildUniversalContext(req, "REFRESHLOG");
  let jei = 0;
  try {
    await logj({
      domain: "jonathan",
      level: "info",
      message: `API cron refrehlog started`,
      file: "app/api/cron/refreshLog/route.ts",
      line: 13,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    await runDbTableStats({
      requestId: built.requestId,
      route: "cron/dbTableStats",
      userId: "JK",
    });

    await logj({
      domain: "jonathan",
      level: "info",
      message: "API cron refreshlog completed",
      file: "app/api/cron/refreshLog/route.ts",
      line: 31,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({
      ok: true,
      executedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    await logj({
      domain: "jonathan",
      level: "error",
      message: "API cron refreshlog error",
      file: "app/api/cron/refreshLog/route.ts",
      line: 48,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json(
      { ok: false, error: "Error executing runDbTableStats" },
      { status: 500 },
    );
  }
}
