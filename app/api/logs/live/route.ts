/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-03-16 01:14:08
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const q = `
    ['domain' != null]
| extend meta = parse_json(meta_json)
| extend payload = parse_json(payload_json)
| project
    id = tostring(@timestamp),   // ← stable unique key
    timestamp = @timestamp,      // ← readable timestamp
    domain,
    level,
    message,
    page = meta.page,
    userId = meta.userId,
    eventIndex = coalesce(payload.eventIndex, eventIndex),
    data = payload.data
| sort by timestamp desc
| limit 50
  `;

  const logs = await queryAxiom(q);
  return NextResponse.json({ logs });
}
