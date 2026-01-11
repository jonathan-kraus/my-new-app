import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/server";
import crypto from "crypto";

export async function GET() {
  const start = Date.now();

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
    server: process.env.NODE_ENV,
    requestId: crypto.randomUUID(),
  };

  // Write to myapp_logs
  await logit({
    level: "info",
    message: "ping",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    line: 12,
    data: payload,
  });

  // Create Axiom client manually (no Pro required)
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN!,
  });

 // Query recent ping events
let result;

try {
  result = await axiom.query(`
    ['myapp_logs']
    | where message == "ping"
    | sort(desc: timestamp)
    | limit(5)
  `);
} catch (err) {
  await logit({
    level: "error",
    message: "Axiom query failed",
    error: err instanceof Error ? err.message : String(err),
    route: "ping",
  });
  throw err;
}

const recent = result?.matches ?? [];


  const durationMs = Date.now() - start;

  return NextResponse.json({
    ...payload,
    durationMs,
    recentPings: recent,
  });
}
