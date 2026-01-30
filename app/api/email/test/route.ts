import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logit } from "@/lib/log/logit";
import { NextResponse } from "next/server";

export const POST = withLogging(async () => {
  const result = await sendTestEmail("jonathankraus2026@outlook.com");

  // Log the result for observability
  logit("email_test_result", {
    result,
  });

  return NextResponse.json(result);
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}
