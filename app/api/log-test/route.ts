// app/api/log-test/route.ts


import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function GET(req: NextRequest) {
  try {

    const eventIndex = 22;

    const ctx = await enrichContext(req);
    await logit(
      "jonathan",
      {
        level: "info",
        message: "GitHub test route completed",

      },
      { eventIndex },
      {
        route: ctx.page,
        userId: ctx.userId,
        requestId: ctx?.requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
    return NextResponse.json({
      ok: true,

    });
  } catch (err) {
    console.error("AXIOM QUERY ERROR", err);
    return NextResponse.json({ ok: false, error: "Axiom query failed" });
  }
}
