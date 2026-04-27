/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-04-24 18:13:38
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const q = `
  ['myapp_logs']
  | where isnotnull(domain) and isnotnull(meta_json)
  | sort by _time desc
  | limit 50
`;

  const logs = await queryAxiom(q);
  return NextResponse.json({ logs });
}
