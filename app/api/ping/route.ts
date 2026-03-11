// app/api/db-tables/route.ts
import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req as any);
  const h = await headers(); // ✅ await the Promise
  const session = await auth();

  await logit(
    "ephemeris",
    {
      level: "info",
      message: "Called Ping",
      sessionUser: session?.user?.name ?? null,
      sessionEmail: session?.user?.email ?? null,
      userId: session?.user?.id ?? null,
      session: session ?? null,
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );
  return NextResponse.json({ ok: true, time: Date.now() });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() });
}
