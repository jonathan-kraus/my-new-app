// app/api/email/test/route.ts

import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
export async function GET(req: NextRequest) {
  const to = "jonathan.c.kraus@gmail.com";
  const ctx = await enrichContext(req);
  const result = await sendTestEmail(to);
  const f1 = "first1";
  const f2 = "first2";
  const f3 = "first3";
  const s1 = "second1";
  const s2 = "second2";
  const s3 = "second3";
  await logit(
    "jonathan",
    { level: "info", message: "Email test finished", debug: "logit-called" },
    {
      requestId: ctx.requestId,
      route: ctx.page,
      userId: ctx.userId,
      payload: {
        result: result,
        first1: f1,
        first2: f2,
        first3: f3,
        second1: s1,
        second2: s2,
        second3: s3,
        debug: "metadata-passed",
      },
    },
  );
  return NextResponse.json(result, { status: 200, statusText: `Test email sent to ${to}`);
}
