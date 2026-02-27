// app/api/test-error/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { withLogging } from "@/lib/logging/withLogging";

export const GET = withLogging(async () => {
  // Log the intentional failure
  logit("test_account_triggered", {
    message: "Intentional 500 test route hit -- returning okay now",
    route: "/api/test-account",
  });

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
});
