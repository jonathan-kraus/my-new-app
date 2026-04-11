// app/api/test-account/route.ts
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { withLogging } from "@/lib/logging/withLogging";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export const GET = withLogging(async (req: Request) => {
  const built = await buildUniversalContext(req as any, "JONATHAN");
  await logj({
    domain: "jonathan",
    level: "info",
    message: "test-account message",
    file: "app/api/test-account/route.ts",
    line: 9,
    payload: {
      some: "data",
    },
    meta: {
      built,
    },
  });

  // Return a real 500 to trigger your Axiom monitor
  //change to 200 after test
  return NextResponse.json({ error: "Intentional test 200" }, { status: 200 });
});
