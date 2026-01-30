// app/api/email/test/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { enrichContext } from "@/lib/log/context";
import { logit } from "@/lib/log/logit";

// -------------------------------------------------------------
// GET — Safe, no side effects
// -------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}

// -------------------------------------------------------------
// POST — Sends the test email intentionally
// -------------------------------------------------------------
export async function POST(req: NextRequest) {
  const { requestId, page, userId } = await enrichContext(req);
  await logit(
    "jonathan",
    {
      level: "info",
      message: "Test email started",
      page,
    },
    {
      requestId,
      page,
      userId,
      payload: {
        debug: "email-test-post",
      },
    }
  );
  // Parse request body
  const body = await req.json().catch(() => ({}));
  const to = body.to || "jonathan.c.kraus@gmail.com";

  // Send the email
  const result = await sendTestEmail(to);

  // Log success
  await logit(
    "jonathan",
    {
      level: "info",
      message: "Test email sent",
      page,
    },
    {
      requestId,
      page,
      userId,
      payload: {
        result,
        debug: "email-test-post",
      },
    }
  );

  return NextResponse.json(result, {
    status: 200,
    statusText: `Test email sent to ${to}`,
  });
}
