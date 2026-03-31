/*
 * @FilePath: \my-new-app\lib\log\build-universal-context.ts
 * @LastEditTime: 2026-03-30 20:53:17
 */
import crypto from "crypto";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(req: NextRequest, route: string) {
  const now = new Date();

  try {
    // Always attempt to load the session
    // NextAuth v5-safe: returns null if no session
    const session = await auth();

    // Always enrich request context
    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId: session?.user?.id ?? null,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      route,
    };
  } catch (err) {
    // Fallback for pages, client-contaminated files, or edge failures
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

export function staticUniversalContext(route: string) {
  const now = new Date();

  return {
    ip: "1.2.3.4",
    url: "kraus.my.id/logs/static",
    requestId: crypto.randomUUID(),
    method: "UNKNOWN",
    route,
    userId: "JKstatic",
    sessionEmail: "static@kraus.my.id",
    sessionUser: "Jonathan Static",
    zulu: now.toISOString(),
    local: now.toLocaleString(),
    runtime: {
      node: process.version,
      region: process.env.VERCEL_REGION ?? "local",
    },
  };
}
