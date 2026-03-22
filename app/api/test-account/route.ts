// app/api/test-error/route.ts
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

const built = await buildUniversalContext("JKR");
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
      built,
    },
  );

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
}
