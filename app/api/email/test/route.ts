// app/api/email/test/route.ts

import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
export async function handleTestEmailRequest(req: NextRequest) {
  const to = "jonathan.c.kraus@gmail.com";
  const { requestId, page, userId } = await enrichContext(req);
  const verifyParam = req.nextUrl.searchParams.get("verify");

  if (verifyParam !== "1278") {
    await logit(
      "jonathan",
      {
        level: "info",
        message: "Email test finished",
        page,
        verify: verifyParam,
      },
      {
        requestId,
        page,
        userId,
        payload: {
          result: null,
          debug: "invalid-verify-param",
        },
      },
    );
    return NextResponse.json(
      { error: "Invalid verify parameter" },
      {
        status: 400,
        statusText: `Invalid verify parameter`,
      },
    );
  }

  const result = await sendTestEmail(to);
  await logit(
    "jonathan",
    {
      level: "info",
      message: "Email test finished",
      page,
      verify: verifyParam,
    },
    {
      requestId,
      page,
      userId,
      payload: {
        result,
        debug: "metadata-passed",
      },
    },
  );
  return NextResponse.json(result, {
    status: 200,
    statusText: `Test email sent to ${to}`,
  });
}
