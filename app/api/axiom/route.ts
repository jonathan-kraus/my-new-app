/*
 * @FilePath: \my-new-app\app\api\axiom\route.ts
 * @LastEditTime: 2026-07-03 20:45:39
 */
import { NextResponse } from "next/server";
import { axiomIngest } from "@/lib/axiom/server";

export async function POST(req: Request) {
  const events = await req.json();
  await axiomIngest(events);
  return NextResponse.json({ ok: true });
}
