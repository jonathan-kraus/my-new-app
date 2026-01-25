// app/api/log-test/route.ts
import { client } from "@/lib/axiom";
import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function GET(req : NextRequest) {
  try {
    const apl =
      "['github-events'] | where repo == \"jonathan-kraus/my-new-app\" | sort by _time desc | limit 3";

    const result = await client.query(apl);
    const legacy = result as any;
    const rows = legacy?.result?.matches ?? [];

    const ctx = await enrichContext(req);
    await logit(
      "jonathan",
      {
        level: "info",
        message: "GitHub test route completed",
        payload: { count: rows.length, rows: rows },
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );
    return NextResponse.json({
      ok: true,
      count: rows.length,
      events: rows,
    });
  } catch (err) {
    console.error("AXIOM QUERY ERROR", err);
    return NextResponse.json({ ok: false, error: "Axiom query failed" });
  }
}
