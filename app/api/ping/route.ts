import { NextResponse, NextRequest } from "next/server";
import { Axiom } from "@axiomhq/js";
import crypto from "crypto";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { db } from "@/lib/db";
import { stat } from "fs";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  console.log("DB TEST");
  const result = await db.log.create({
    data: {
      level: "info",
      message: "Test log from dev",
      domain: "test",
      payload: {},
      meta: {},
    },
  });
  console.log("DB TEST RESULT", result);

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Ping route hit (axiom test)",
      payload: {
        uuid: crypto.randomUUID(),

        route: "/api/ping",
      },
    },
    {
      requestId: "requestId",
      route: "page",
      userId: "userId",
    },
  );

return NextResponse.json({ ok: false, time: Date.now() }, { status: 500 });
}
