import { NextRequest, NextResponse } from "next/server";
import { enrichContext } from "@/lib/log/context";
import { logit } from "@/lib/log/server";
import { getRequestDuration } from "@/lib/log/timing";
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);
  const durationStartId = ctx.requestId;

  await logit({
    ...ctx,
    level: "info",
    message: "Astronomy GET started",
    page: "/api/astronomy",
    file: "app/api/astronomy/route.ts",
  });
console.log("API ROUTE requestId:", req.headers.get("x-request-id"));

  try {
    const snapshot = await getAstronomySnapshot();

    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "info",
      message: "Astronomy GET completed",
      durationMs,
      page: "/api/astronomy",
      file: "app/api/astronomy/route.ts",
      data: { date: snapshot.date },
    });

    return NextResponse.json({ snapshot });
  } catch (err: any) {
    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "error",
      message: "Astronomy GET failed",
      durationMs,
      page: "/api/astronomy",
      file: "app/api/astronomy/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch astronomy data" },
      { status: 500 },
    );
  }
}
