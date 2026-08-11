// app/api/cron/refreshLog/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
      line: 14,
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
      line: 32,
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
      line: 49,
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
