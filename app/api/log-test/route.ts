// app/api/log-test/route.ts
import { client } from "@/lib/axiom";
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";

export async function GET() {
  try {
    const result = await client.query({
      dataset: "github-events",
      filter: {
        repo: "jonathan-kraus/my-new-app",
      },
      sort: [{ field: "_time", desc: true }],
      limit: 3,
    });

    const rows = result.data ?? [];

    await logit(
      "jonathan",
      { level: "info", message: "GitHub test route completed" },
      { count: rows.length }
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
