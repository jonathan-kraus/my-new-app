import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logit } from "@/lib/log/logit";
import { NextResponse } from "next/server";

export const POST = withLogging(async () => {
  const test_msg1 = "This is a test email sent from the Next.js API route.";
  const test_subject = "Test Email Subject";
  const result = await sendTestEmail(test_msg1, test_subject);
  const eventIndex = 22;
  const requestId = crypto.randomUUID();
  await logit(
    "jonathan",
    {
      level: "info",
      message: `Sent test email with message "${test_msg1}". Result: ${JSON.stringify(result, null, 2)}`,
      result: result,
      b: "b",
    },
    { eventIndex },
    {
      requestId: requestId,
      route: "api/email/test",
      userId: "JK",
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  return NextResponse.json(result);
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}
