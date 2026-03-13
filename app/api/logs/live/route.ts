/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-03-12 22:18:21
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const q = `
    ['domain' != null]
    | extend meta = parse_json(meta_json)
    | extend payload = parse_json(payload_json)
    | project
        timestamp = @timestamp,
        domain,
        level,
        message,
        page = meta.page,
        userId = meta.userId,
        eventIndex = payload.eventIndex,
        data = payload.data
    | sort by timestamp desc
    | limit 50
  `;

  const logs = await queryAxiom(q, 30); // last 30 minutes
  return NextResponse.json({ logs });
}
