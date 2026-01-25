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

  const res = await fetch(
    `https://api.vercel.com/v1/usage?teamId=${process.env.VERCEL_TEAM_ID}&from=${from}&to=${to}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    },
  );

  // Final log with correct duration
  await logit(
    "jonathan",
    {
      level: "info",
      message: "ping completed",
      payload: res,
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );
  return Response.json({ res });
}
