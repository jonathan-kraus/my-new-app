/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-04-24 17:52:16
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
const q = `
  ['myapp_logs']
  | sort by _time desc
  | limit 10
`;

  const logs = await queryAxiom(q);
  return NextResponse.json({ logs });
}
