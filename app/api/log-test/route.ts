// app/api/log-test/route.ts
"use server";

import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { randomUUID } from "crypto";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});
export async function GET() {
  const requestId = randomUUID();

  // #1
  await logit(
    "jonathan",
    { level: "info", message: "GitHub test route started" },
    { requestId },
  );

  // Safe APL query (no parentheses, no functions, no syntax errors)
const apl = `
['github-events']
| where repo == "jonathan-kraus/my-new-app"
| sort desc "data.updatedAt"
| limit 20 `;

  let result = null;

  try {
    // #2
    await logit(
      "jonathan",
      { level: "info", message: "Running GitHub APL query" },
      { requestId },
    );

    result = await axiom.query(apl);

    // #3
    await logit(
      "jonathan",
      { level: "info", message: "GitHub APL query completed" },
      { requestId },
    );
  } catch (err: any) {
    // #X (error)
    await logit(
      "jonathan",
      {
        level: "error",
        message: "GitHub APL query failed",
        error: err?.message ?? String(err),
      },
      { requestId },
    );

    return NextResponse.json(
      { ok: false, error: "GitHub query failed", details: err?.message },
      { status: 500 },
    );
  }

  // #4
  await logit(
    "jonathan",
    { level: "info", message: "GitHub test route completed" },
    { requestId },
  );

  const rows = (result as any)?.data ?? [];
  return NextResponse.json({ ok: true, count: rows.length, events: rows });
}
