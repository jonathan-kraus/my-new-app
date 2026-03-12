/*
 * @FilePath: \my-new-app\app\api\set-flight-id\route.ts
 * @LastEditTime: 2026-03-11 20:03:41
 */
import { NextResponse } from "next/server";
import { setConfig } from "@/lib/runtime/config"; // your existing config helper

export async function POST(req: Request) {
  const { ident } = await req.json();

  if (!ident) {
    return NextResponse.json({ error: "Missing ident" }, { status: 400 });
  }

  await setConfig("flight-ID", ident);

  return NextResponse.json({ success: true });
}
