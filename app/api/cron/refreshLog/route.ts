// app/api/cron/refreshLog/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runDbTableStats } from "@/lib/cron/runDbTableStats";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logj } from "@/lib/log/logj";
import { withRequestTiming } from "@/lib/log/with-request-timing";

export const runtime = "nodejs";

async function GETHandler(req: NextRequest) {
  const built = await buildUniversalContext(req, "REFRESHLOG");
  let jei = 0;
  try {
    await logj({
      domain: "Jonathan",
      level: "info",
      message: `API cron refrehlog started`,
      file: "app/api/cron/refreshLog/route.ts",
      line: 15,
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
      domain: "Jonathan",
      level: "info",
      message: "API cron refreshlog completed",
      file: "app/api/cron/refreshLog/route.ts",
      line: 33,
      payload: {
        some: "data",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({
      ok: true,
      executedAt: new Date().toISOString(),
    });
  } catch {
    await logj({
      domain: "Jonathan",
      level: "error",
      message: "API cron refreshlog error",
      file: "app/api/cron/refreshLog/route.ts",
      line: 50,
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

export const GET = withRequestTiming("GET", "/cron/refreshLog", GETHandler);
