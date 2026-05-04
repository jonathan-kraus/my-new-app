// app/api/email/test/route.ts
import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { NextRequest, NextResponse } from "next/server";

export const POST = withLogging(async (req: Request) => {
  const test_msg1 = "This is a test email sent from the Next.js API route.";
  const test_subject = "Test Email Subject";
  let jei = 0;
  const result = await sendTestEmail(test_msg1, test_subject);

  // FIXED: buildUniversalContext now requires (req, routeName)
  const built = await buildUniversalContext(req as any, "EMAILTEST");

  await logj({
    domain: "jonathan",
    level: "info",
    message: `Sent test email with message "${test_msg1}". Result: ${JSON.stringify(result)}`,
    file: "app/api/email/test/route.ts",
    line: 17,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return NextResponse.json(result);
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}
