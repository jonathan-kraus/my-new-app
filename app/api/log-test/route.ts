import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);
  logit({
    level: "info",
    message: "log-test route hit",
    jonathan: { action: "test" },
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  });

  return Response.json({ ok: true });
}
