import { NextResponse } from "next/server";
import { withAxiom } from "next-axiom";
import { logit } from "@/lib/log/server";
import crypto from "crypto";

export const GET = withAxiom(async (req, { axiom }) => {
  const start = Date.now();

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
    server: process.env.NODE_ENV,
    requestId: crypto.randomUUID(),
  };

  // Write to your existing logs dataset (myapp_logs)
  await logit({
    level: "info",
    message: "ping",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    line: 12,
    data: payload,
  });

  // Query the same dataset for recent ping events
  const result = await axiom.query("myapp_logs", {
    filter: `message == "ping"`,
    limit: 5,
    order: "desc",
  });

  const recent = result?.matches ?? [];

  const durationMs = Date.now() - start;

  return NextResponse.json({
    ...payload,
    durationMs,
    recentPings: recent,
  });
});
