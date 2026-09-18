/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-09-18 17:30:53
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const dataset = process.env.AXIOM_DATASET?.trim();
  if (!dataset) {
    console.error("[GET /api/logs/live] AXIOM_DATASET is not configured");
    return NextResponse.json(
      { error: "Log dataset is not configured" },
      { status: 503 },
    );
  }

  const q2 = `
  [${JSON.stringify(dataset)}]
  | where isnotnull(domain)
  | sort by _time desc
  | limit 50
`;

  const startedAt = Date.now();
  try {
    const logs = await queryAxiom(q2);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[GET /api/logs/live] Axiom query failed", {
      elapsedMs: Date.now() - startedAt,
      query: q2,
      hasAxiomToken: Boolean(process.env.AXIOM_TOKEN),
      hasAxiomOrgId: Boolean(process.env.AXIOM_ORG_ID),
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      status:
        error instanceof Error && "status" in error ? error.status : undefined,
    });
    return NextResponse.json(
      { error: "Unable to fetch logs" },
      { status: 500 },
    );
  }
}
