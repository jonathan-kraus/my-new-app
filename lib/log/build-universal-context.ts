import crypto from "crypto";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(req: NextRequest, route: string) {
  const now = new Date();

  try {
    const session = await auth(); // v5-safe inside route handlers

    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId: session?.user?.id ?? null,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      route,
    };
  } catch {
    return {
      ip: null,
      url: null,
      requestId: crypto.randomUUID(),
      method: "UNKNOWN",
      route,
      userId: null,
      sessionEmail: null,
      sessionUser: null,
      zulu: now.toISOString(),
      local: now.toLocaleString(),
      runtime: {
        node: process.version,
        region: process.env.VERCEL_REGION ?? "local",
      },
    };
  }
}
