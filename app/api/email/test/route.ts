// app\api\email\test\route.ts
import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { NextResponse } from "next/server";

export const POST = withLogging(async () => {
  const test_msg1 = "This is a test email sent from the Next.js API route.";
  const test_subject = "Test Email Subject";
  const result = await sendTestEmail(test_msg1, test_subject);
  const built = await buildUniversalContext("EMAILTEST");

  await logj(
    "jonathan",
    "app/api/email/test/route.ts",
    13,
    {
      level: "info",
      message:
        'Sent test email with message "${test_msg1}". Result: ${JSON.stringify(result, null, 2)',
      test_msg1: test_msg1,
    },
    {
      somedata: "123456",
    },
    built,
  );

  return NextResponse.json(result);
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}
