/*
 * @FilePath: \my-new-app\app\api\log\route.ts
 * @LastEditTime: 2026-04-02 00:06:14
 */
// app/api/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth();

    // Merge server-known session data so the client doesn't have to send it
    await logj({
      ...body,
      payload: {
        ...body.payload,
        userId: session?.user?.id ?? body.payload?.userId,
        sessionEmail: session?.user?.email ?? body.payload?.sessionEmail,
        sessionUser: session?.user?.name ?? body.payload?.sessionUser,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Client log route error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
