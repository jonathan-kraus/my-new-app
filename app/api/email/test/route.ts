// app\api\email\test\route.ts
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
export async function GET(req: NextRequest) {
  const to = "jonathan.c.kraus@gmail.com";
  const ctx = await enrichContext(req);
  await sendTestEmail(to);
  await logit({
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    level: "info",
    message: "Email test sent",
    jonathan: { to: to },
  });
  return NextResponse.json(`Test email sent to ${to}`);
}
