import { NextResponse, NextRequest } from "next/server";
import { Axiom } from "@axiomhq/js";
import { log } from "next-axiom";
import crypto from "crypto";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  logit(
    "jonathan",
    {
      level: "info",
      message: "Ping route hit",
      payload: { som: crypto.randomUUID(), start: start },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

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
