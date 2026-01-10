// app/api/ping/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/server";

export async function GET() {
  const start = Date.now();

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
    server: process.env.NODE_ENV,
    requestId: crypto.randomUUID(),
  };

  await logit({
    level: "info",
    message: "ping",
    page: "Ping API",
    file: "app/api/ping/route.ts",
    line: 12,
    data: payload,
  });

  const durationMs = Date.now() - start;

  return NextResponse.json({
    ...payload,
    durationMs,
  });
}
