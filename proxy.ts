/*
 * @FilePath: \my-new-app\proxy.ts
 * @LastEditTime: 2026-08-13 01:59:00
 */
import { Logger } from "next-axiom";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import normalizePath from "@/lib/normalizePath";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isInternal =
    pathname.startsWith("/_next") || pathname === "/favicon.ico";

  const isPrefetch =
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("x-middleware-prefetch") === "1" ||
    req.headers.get("next-router-prefetch") === "1";

  if (isInternal || isPrefetch) {
    return NextResponse.next();
  }

  // Date.now() is safe to forward to a page/route and compare there.
  const requestStartedAt = Date.now();
  const requestId = crypto.randomUUID();

  // performance.now() is excellent for a local micro-measurement.
  const normalizeStartedAt = performance.now();

  // normalizePath expects an absolute URL, not "/forecast".
  const { last, lastTwo } = normalizePath(req.url);

  const normalizeDurationMs = performance.now() - normalizeStartedAt;

  const built = await buildUniversalContext(req, "PROXY");

  await logj({
    domain: "jonathan",
    level: "info",
    message: `Normalized path ${pathname}  in ${normalizeDurationMs.toFixed(3)} ms`,
    file: "proxy.ts",
    line: 35,
    payload: {
      requestId,
      pathname,
      last,
      lastTwo,
      normalizeDurationMs: Number(normalizeDurationMs.toFixed(3)),
    },
    meta: {
      built: {
        ...built,
        eventIndex: 1,
      },
    },
  });

  // Retain this if you want next-axiom's middleware request instrumentation.
  const logger = new Logger({ source: "middleware" });
  logger.middleware(req);

  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  // These are request headers forwarded to the page/route—not response headers.
  const forwardedHeaders = new Headers(req.headers);

  forwardedHeaders.set("x-app-request-started-at", String(requestStartedAt));

  forwardedHeaders.set("x-app-request-id", requestId);

  return NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)", "/api/weather/forecast/:path*"],
};
