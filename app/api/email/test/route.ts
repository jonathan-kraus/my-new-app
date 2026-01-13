import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/server";
import { enrichContext } from "@/lib/log/context";
export async function GET(req: NextRequest) {
  const to = "jonathan.c.kraus@gmail.com";
  const ctx = await enrichContext(req);
  await sendTestEmail(to);
  await logit({
    ...ctx,
    level: "info",
    message: "Email test sent",
    sessionUser: "Jonathan",
  });
  return NextResponse.json(`Test email sent to ${to}`);
}
