import { NextRequest, NextResponse } from "next/server";
import { enrichContext } from "@/lib/log/context";
import { logit } from "@/lib/log/server";
import { getRequestDuration } from "@/lib/log/timing";
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);

  await logit({
    ...ctx,
    level: "info",
    message: "Astronomy GET started",
    eventIndex: ctx.eventIndex,
    page: "/api/astronomy",
    file: "app/api/astronomy/route.ts",
  });

  try {
    const { today, tomorrow } = await getAstronomySnapshot("KOP");

    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "info",
      message: "Astronomy snapshot date check",
      data: {
        todayDate: today?.date ?? null,
        tomorrowDate: tomorrow?.date ?? null,
        now: new Date().toISOString(),
      },
    });

    await logit({
      ...ctx,
      level: "info",
      message: "Astronomy GET completed",
      durationMs,
      eventIndex: ctx.eventIndex,
      data: {
        todayDate: today?.date ?? null,
        tomorrowDate: tomorrow?.date ?? null,
      },
    });

    return NextResponse.json({
      today: today,
      tomorrow: tomorrow,
    });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "error",
      message: "Astronomy GET failed",
      durationMs,
      eventIndex: ctx.eventIndex,
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch astronomy data" },
      { status: 500 },
    );
  }
}
