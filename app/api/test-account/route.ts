// app/api/test-error/route.ts
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { withLogging } from "@/lib/logging/withLogging";

export const GET = withLogging(async () => {
  // Log the intentional failure
  logit("test_account_triggered", {
    message: "Intentional 500 test route hit",
    route: "/api/test-account",
  });

  // Return a real 500 to trigger your Axiom monitor
  return NextResponse.json({ error: "Intentional test 500" }, { status: 500 });
});
