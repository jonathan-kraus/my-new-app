// lib/travel/next/route.ts
import { NextResponse } from "next/server";
import { getNextTravelEvent } from "@/lib/travel/next-event";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const requestId = crypto.randomUUID();

  await logit("travel", {
        level: "info",
        message: "Starting next travel event computation",
        page: "lib/travel/next/route.ts",
        somedate: new Date().toISOString(),
        somevalue: "somevalue",
      }, { eventIndex }, {
          requestId,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  try {
    const event = await getNextTravelEvent(requestId);

    await logit("travel", {
            level: "info",
            message: "Next travel event computed",
            page: "lib/travel/next/route.ts",
            somedate: new Date().toISOString(),
            somevalue: "somevalue",
          }, { eventIndex }, {
            requestId,
            requestId: ctx?.requestId ?? req?.id,
            zulu: new Date().toISOString(),
            local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
          });

    return NextResponse.json({
      ok: true,
      requestId,
      event,
    });
  } catch (err: any) {
    await logit("travel", {
            level: "error",
            message: "Failed to compute next travel event",
            page: "lib/travel/next/route.ts",
            somedate: new Date().toISOString(),
            somevalue: "somevalue",
            error: err.message,
          }, { eventIndex }, {
            requestId,
            requestId: ctx?.requestId ?? req?.id,
            zulu: new Date().toISOString(),
            local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
          });

    return NextResponse.json(
      { ok: false, requestId, error: err.message },
      { status: 500 },
    );
  }
}
