/*
 * @FilePath: \my-new-app\app\api\axiom\route.ts
 * @LastEditTime: 2026-07-03 19:56:21
 */
import { NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

export async function POST(req: Request) {
  const body = await req.json();

  await axiom.ingest(process.env.AXIOM_DATASET!, body);

  return NextResponse.json({ ok: true });
}
