// app/api/email/test/route.ts

import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{}> }
) {
  const { requestId, page, userId } = await enrichContext(req);

  // Parse request body
  const body = await req.json();
  const to = body.to || "jonathan.c.kraus@gmail.com";
  const verifyParam = body.verify;

  if (verifyParam !== "1278") {
    await logit(
      "jonathan",
      {
        level: "info",
        message: "Email test finished",
        reason: "invalid-verify-param",
        context: context,
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
        statusText: "Invalid verify parameter",
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
