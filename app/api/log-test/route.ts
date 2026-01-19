import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { NextRequest } from "next/server";
import { getLength } from "@/lib/log/queue";
export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);
  console.log("QUEUE LENGTH: before", getLength());

  logit(
    "jonathan",
    {
      level: "info",
      message: "log-test route hit",
      payload: { action: "test" },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );
  console.log("QUEUE LENGTH: after", getLength());
  return Response.json({ ok: true });
}
