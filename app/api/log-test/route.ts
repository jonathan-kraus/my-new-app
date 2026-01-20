// app/api/log-test/route.ts
import { client } from "@/lib/axiom";
import { NextResponse } from "next/server";
import { logit } from '@/lib/log/logit';

export async function GET() {
  const apl = `
['github-events']
| where repo == "jonathan-kraus/my-new-app"
| sort by _time desc
| limit 3
`;

  try {
    const result = await client.query(apl);
    console.log("AXIOM RAW RESULT", result);
const legacy = result as any;
const rows = legacy?.result?.matches ?? [];


  // #4
  await logit(
    "jonathan",
    { level: "info", message: "GitHub test route completed" },
    { legacy: legacy },
  );
    console.log("AXIOM QUERY RESULT", rows);

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
