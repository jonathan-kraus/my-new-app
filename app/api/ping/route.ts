import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";


export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  console.log("DB TEST");

  console.log("DB TEST RESULT");

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Ping route hit (axiom test)",
      payload: {
        uuid: "uuid",

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
