/*
 * @FilePath: \my-new-app\.vscode\fre.ts
 * @LastEditTime: 2026-02-22 13:49:43
 */

import { NextRequest, NextResponse } from "next/server";
import { Axiom } from "@axiomhq/js";

export async function GET(req: NextRequest) {
  const H21 = Date.now();
  console.log(H21);

  console.log("DB TEST", H21, req);
  return NextResponse.json({ ok: true, time: H21 });
}
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});
