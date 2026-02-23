// lib/travel/next/route.ts
import { NextResponse } from "next/server";
import { getNextTravelEvent } from "@/lib/travel/next-event";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const requestId = crypto.randomUUID();

  await logit(
    "travel",
    {
      level: "info",
      message: "Starting next travel event computation",
      payload: {
        page: "lib/travel/next/route.ts",
        somedate: new Date().toISOString(),
        somevalue: "somevalue",
      },
    },
    { requestId },
  );

  try {
    const event = await getNextTravelEvent(requestId);

    await logit(
      "travel",
      {
        level: "info",
        message: "Next travel event computed",
        payload: {
          page: "lib/travel/next/route.ts",
          somedate: new Date().toISOString(),
          somevalue: "somevalue",
        },
      },
      { requestId },
    );

    return NextResponse.json({
      ok: true,
      requestId,
      event,
    });
  } catch (err: any) {
    await logit(
      "travel",
      {
        level: "error",
        message: "Failed to compute next travel event",
        payload: {
          page: "lib/travel/next/route.ts",
          somedate: new Date().toISOString(),
          somevalue: "somevalue",
          error: err.message,
        },
      },
      { requestId },
    );

    return NextResponse.json(
      { ok: false, requestId, error: err.message },
      { status: 500 },
    );
  }
}
