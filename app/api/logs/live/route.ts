/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-04-24 17:40:22
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const q = `
    ['domain' != null]
| extend meta = parse_json(meta_json)
| extend payload = parse_json(payload_json)
| project
    id = tostring(_time),   // ← stable unique key
    timestamp = _time,      // ← readable timestamp
    domain,
    level,
    message,
    page = meta.page,
    userId = meta.userId,
| sort by timestamp desc
| limit 50
  `;

  const logs = await queryAxiom(q);
  return NextResponse.json({ logs });
}
