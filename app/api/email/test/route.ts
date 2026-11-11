import { withRequestTiming } from "@/lib/log/with-request-timing";
// app/api/email/test/route.ts
// app/api/email/test/route.ts
import { withLogging } from "@/lib/logging/withLogging";
import { sendTestEmail } from "@/lib/server/email/sendTestEmail";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const POSTHandler = withLogging(async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "Sign in required to send a test email." },
      { status: 401 },
    );
  }

  const test_msg1 = "This is a test email sent from the Next.js API route.";
  const test_subject = "Test Email Subject";
  let jei = 0;
  const result = await sendTestEmail(test_msg1, test_subject);

  // FIXED: buildUniversalContext now requires (req, routeName)
  const built = await buildUniversalContext(req, "EMAILTEST");

  await logj({
    domain: "Jonathan",
    level: "info",
    message: `Sent test email with message "${test_msg1}". Result: ${JSON.stringify(result)}`,
    file: "app/api/email/test/route.ts",
    line: 28,
    payload: {
      result: result,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return NextResponse.json(result);
});

async function GETHandler() {
  return NextResponse.json({
    ok: true,
    message: "Email test endpoint. Use POST to send a test email.",
  });
}

export const POST = withRequestTiming("POST", "/email/test", POSTHandler);
export const GET = withRequestTiming("GET", "/email/test", GETHandler);
