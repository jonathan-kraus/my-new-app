// lib/travel/next/route.ts
import { NextResponse } from "next/server";
import { getNextTravelEvent } from "@/lib/travel/next-event";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const built = await buildUniversalContext(req as any, "travel-next");
  let jei = 0;

  await logj({
    domain: "travel",
    level: "info",
    message: "Starting next travel event computation",
    file: "lib/travel/next/route.ts",
    line: 14,
    payload: {
      page: "lib/travel/next/route.ts",
      somedate: new Date().toISOString(),
      somevalue: "somevalue",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    const event = await getNextTravelEvent((built as any).requestId);

    await logj({
      domain: "travel",
      level: "info",
      message: "Next travel event computed",
      file: "lib/travel/next/route.ts",
      line: 31,
      payload: {
        page: "lib/travel/next/route.ts",
        somedate: new Date().toISOString(),
        somevalue: "somevalue",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({
      ok: true,
      requestId: (built as any).requestId,
      event,
    });
  } catch (err: any) {
    await logj({
      domain: "travel",
      level: "error",
      message: "Failed to compute next travel event",
      file: "lib/travel/next/route.ts",
      line: 51,
      payload: {
        page: "lib/travel/next/route.ts",
        somedate: new Date().toISOString(),
        somevalue: "somevalue",
        error: err.message,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    return NextResponse.json(
      { ok: false, requestId, error: err.message },
      { status: 500 },
    );
  }
}
