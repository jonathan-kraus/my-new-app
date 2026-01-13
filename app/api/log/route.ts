// app/api/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logit } from "@/lib/log/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await logit({
      level: body.level ?? "info",
      message: body.message ?? "",
      file: body.file ?? null,
      data: body.data ?? null,
      requestId: body.requestId ?? null,
      userId: body.userId ?? null,
      sessionEmail: body.sessionEmail ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
