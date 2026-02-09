import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logit } from "@/lib/log/logit";
import { NextResponse } from "next/server";

export const POST = withLogging(async () => {
  const test_msg1 = "This is a test email sent from the Next.js API route.";
  const result = await sendTestEmail(
    "jonathankraus2026@outlook.com",
    test_msg1,
  );

  await logit("jonathan", {
    level: "info",
    message: `Sent test email  with message "${test_msg1}". Result: ${result}`,

    payload: { result: result, b: "b" },
  });

  return NextResponse.json(result);
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}
