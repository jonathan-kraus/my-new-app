// app/api/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Used to be logit here");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
