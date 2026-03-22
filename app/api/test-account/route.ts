// app/api/test-error/route.ts
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";

const eventIndex = 22;
const requestId = crypto.randomUUID();
export async function GET() {
  // Log the intentional failure
  await logj(
    "test_account_triggered",
    "app/api/test-account/route.ts",
    9,
    {
      message: "Intentional 500 test route hit -- returning okay now",
      route: "/api/test-account",
    },
    { somedata: "1234" },
    {
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
}
