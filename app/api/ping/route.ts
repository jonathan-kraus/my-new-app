import { NextResponse, NextRequest } from "next/server";
import { Axiom } from "@axiomhq/js";
import { log } from "next-axiom";
import crypto from "crypto";
import { logit } from "@/lib/log/server";
import { enrichContext } from "@/lib/log/context";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  await logit({
    ...ctx,
    level: "info",
    message: "in PING",
  });

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
    server: process.env.NODE_ENV,
    requestId: crypto.randomUUID(),
  };

  // Create Axiom client
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN!,
  });

  let result;
  try {
    result = await axiom.query(`
['myapp_logs']
| where message == "ping"
| order by _time desc
| limit(7)
`);
  } catch (err) {
    await logit({
      ...ctx,
      level: "error",
      message: "Axiom query failed",
      page: "Ping API",
      file: "app/api/ping/route.ts",
      data: {
        route: "ping",
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
  log.info("astronomy", {
    data: {
      sunrise: "2026-01-10 07:21:00",
      sunset: "2026-01-10 16:56:00",
      moonrise: "2026-01-10 00:01:00",
      moonset: "2026-01-10 11:14:00",
      moonPhase: 1.0,
      locationId: "KOP",
      fetchedAt: new Date().toISOString(),
    },
  });

  const recent = result?.matches ?? [];
  const durationMs = Date.now() - start;

  // Final log with correct duration
  await logit({
    ...ctx,
    level: "info",
    message: "ping completed",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    durationMs,
    data: payload,
  });

  return NextResponse.json({
    ...payload,
    durationMs,
    recentPings: recent,
  });
}
