import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logit } from "@/lib/log/logit";
import { NextResponse } from "next/server";

export const POST = withLogging(async () => {
  const result = await sendTestEmail("jonathankraus2026@outlook.com", "test_msg1");


  await logit(
    "jonathan",
    {
      level: "info",
      message: `Sent test email to ${result.to} with message "${test_msg1}" and subject "${result.subject}"`,

      payload: { result: result,
        b: "b",
       },
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
