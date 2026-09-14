/*
 * @FilePath: \my-new-app\src\lib\log\build-universal-context.ts
 * @LastEditTime: 2026-09-13 20:15:13
 */
import crypto from "crypto";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(req: Request, route: string) {
  const now = new Date();

  try {
    // Always attempt to load the session
    const session = await auth();

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
      userId: null,
      sessionEmail: null,
      sessionUser: null,
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
