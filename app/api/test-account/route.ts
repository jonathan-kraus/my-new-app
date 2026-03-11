// app/api/test-error/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { withLogging } from "@/lib/logging/withLogging";

export async function GET() {
  // Log the intentional failure
  await logit("test_account_triggered", {
      message: "Intentional 500 test route hit -- returning okay now",
      route: "/api/test-account",
    }, { eventIndex }, {
        requestId: ctx?.requestId ?? req?.id,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      });

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
}
