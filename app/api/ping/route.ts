import { NextResponse, NextRequest } from "next/server";
import { Axiom } from "@axiomhq/js";
import { log } from "next-axiom";
import crypto from "crypto";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Ping route hit (axiom test)",
      payload: {
        uuid: crypto.randomUUID(),
        start,
        route: "/api/ping",
      },
    },
    {
      requestId: ctx.requestId,
      route: ctx.page,
      userId: ctx.userId,
    },
  );
  try {
    const ax = new Axiom({ token: process.env.AXIOM_TOKEN! });

    await ax.ingest("myapp_logs", [
      {
        // top-level fields (Axiom will flatten these)
        directTest: true,
        route: "/api/ping",
        timestamp: new Date().toISOString(),

        // nested JSON (Axiom will store this as JSON)
        dataj: {
          domain: "jonathan",
          level: "info",
          message: "Direct Axiom ingest test",
          payload: {
            uuid: crypto.randomUUID(),
            start,
          },
          meta: {
            requestId: ctx.requestId,
            userId: ctx.userId,
            page: ctx.page,
          },
          timestamp: new Date().toISOString(),
        },
      },
    ]);
  } catch (err) {
    console.error("Direct Axiom ingest failed:", err);
  }

  const projectId = process.env.VERCEL_PROJECT_ID;

  const res = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    },
  );
  const raw = await res.text(); // Try to parse JSON safely
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {}
  // Final log with correct duration
  await logit(
    "jonathan",
    {
      level: "info",
      message: "ping completed",
      payload: { status: res.status, ok: res.ok, body: raw },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  return Response.json(json);
}
