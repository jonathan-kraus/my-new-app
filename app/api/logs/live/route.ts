/*
 * @FilePath: \my-new-app\app\api\logs\live\route.ts
 * @LastEditTime: 2026-04-24 17:44:01
 */
import { NextResponse } from "next/server";
import { queryAxiom } from "@/lib/axiom/query";

export async function GET() {
  const q = `
  ['domain' != null]
  | extend meta = parse_json(meta_json)
  | project
      _time,
      domain,
      level,
      message,
      eventIndex,
      meta_json,
      payload_json,
      page = tostring(meta['route']),
      userId = tostring(meta['userId']),
      sessionEmail = tostring(meta['sessionEmail'])
  | sort by _time desc
  | limit 50
`;

  const logs = await queryAxiom(q);
  return NextResponse.json({ logs });
}
