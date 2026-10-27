/*
 * @FilePath: \my-new-app\src\lib\log\build-universal-context.ts
 * @LastEditTime: 2026-10-26 17:36:20
 */

import { auth } from "@/auth";
import { enrichContext } from "./context";
import { headers } from "next/headers";
import { v7 } from "uuid";

/** Build request logging context for an App Router page (page props are not a Request). */
export async function buildPageUniversalContext(
  route: string,
  pathname: string,
) {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    incomingHeaders.get("host") ??
    "localhost";
  const forwardedProtocol = incomingHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProtocol === "http" ? "http:" : "https:";
  const request = new Request(new URL(pathname, `${protocol}//${host}`), {
    method: "GET",
    headers: incomingHeaders,
  });
  return buildUniversalContext(request, route);
}

export async function buildUniversalContext(req: Request, route: string) {
  const now = new Date();

  // Load the session before enriching context so session fields remain
  // available even if request enrichment fails.
  const session = await auth().catch(() => null);

  try {
    // Correct call — no type annotation inside the call
    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? v7(),
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
      requestId: v7(),
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
