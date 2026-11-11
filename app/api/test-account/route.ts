import { withRequestTiming } from "@/lib/log/with-request-timing";
// app/api/test-account/route.ts
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { withLogging } from "@/lib/logging/withLogging";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

const GETHandler = withLogging(async (req: Request) => {
  const built = await buildUniversalContext(req, "Jonathan");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "test-account message",
    file: "app/api/test-account/route.ts",
    line: 10,
    payload: {
      ip: built.ip,
      req: req,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
});

export const GET = withRequestTiming("GET", "/test-account", GETHandler);
