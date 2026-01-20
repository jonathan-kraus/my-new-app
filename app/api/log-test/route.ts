// app/api/log-test/route.ts
import { client } from "@/lib/axiom";
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";

export async function GET() {
  try {
    const apl = ` ['github-events']
    | sort by _time desc
    | limit 7 `;
    const result = await client.query(apl);
    const legacy = result as any;
    const rows = legacy?.result?.matches ?? [];

    await logit(
      "jonathan",
      { level: "info", message: "GitHub test route completed" },
      { count: rows.length, rows: rows },
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
