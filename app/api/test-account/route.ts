// app/api/test-account/route.ts
import { NextResponse } from "next/server";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logj } from "@/lib/log/logj";
import { withRequestTiming } from "@/lib/log/with-request-timing";
import { withLogging } from "@/lib/logging/withLogging";

const GETHandler = withLogging(async (req: Request) => {
  const built = await buildUniversalContext(req, "Jonathan");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "test-account message",
    file: "app/api/test-account/route.ts",
    line: 11,
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
