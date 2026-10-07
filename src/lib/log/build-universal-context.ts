/*
 * @FilePath: \my-new-app\src\lib\log\build-universal-context.ts
 * @LastEditTime: 2026-09-13 20:15:13
 */

import crypto from "crypto";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(req: Request, route: string) {
  const now = new Date();

  // Load the session BEFORE enriching the request. Some callers (notably App
  // Router pages like app/admin/runtime/page.tsx, which declare their props
  // as `req: NextRequest`) pass a props object instead of a real Request.
  // That makes enrichContext throw on req.headers.get(...) before auth() is
  // ever reached, and the catch below used to wipe the session info to null.
  // Loading auth() up front keeps user info populated even when enrichment
  // fails.
  const session = await auth().catch(() => null);

  try {
    // Correct call — no type annotation inside the call
    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId: session?.user?.id ?? null,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      route,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return {
      ip: null,
      url: null,
      requestId: crypto.randomUUID(),
      method: "UNKNOWN",
      route,
      userId: session?.user?.id ?? null,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      zulu: now.toISOString(),
      local: now.toLocaleString(),
      runtime: {
        node: process.version,
        region: process.env.VERCEL_REGION ?? "local",
      },
      error: message,
    };
  }
}
