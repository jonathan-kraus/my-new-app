import { Logger } from "next-axiom";
import { NextResponse, NextRequest } from "next/server";

import {
  markRequestStart,
  getRequestDuration,
  getRequestId,
  nextEventIndex,
  clearRequest,
} from "@/lib/log/timing";

import { logj } from "@/lib/log/logj";

// ❗ IMPORTANT: middleware cannot read session in NextAuth v5
// ❗ IMPORTANT: middleware cannot call buildUniversalContext()
// So we remove both from middleware.

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // --- 0) Filter out ALL noise -----------------------------------
  const isInternal =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon");

  pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/" ||
    pathname.startsWith("/logs");

  if (isInternal) {
    return NextResponse.next();
  }

  // Prefetch detection (correct way)
  const isPrefetch =
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("x-middleware-prefetch") === "1";

  if (isPrefetch) {
    return NextResponse.next();
  }

  // --- 2) Start timing -------------------------------------------
  markRequestStart(req.url);
  const logger = new Logger({ source: "middleware" });
  logger.middleware(req);

  // --- 3) Skip NextAuth routes -----------------------------------
  if (pathname.startsWith("/api/auth")) {
    return end(req, NextResponse.next());
  }

  // --- 4) Auth check (middleware cannot read session in v5) ------
  // We cannot do:
  // const session = await auth(req);
  // So we only enforce redirect based on cookies.

  const hasSessionCookie = req.cookies.get("next-auth.session-token") ||
                           req.cookies.get("__Secure-next-auth.session-token");

  if (!hasSessionCookie) {
    return end(
      req,
      NextResponse.redirect(new URL("/api/auth/signin", req.url)),
    );
  }

  // --- 5) Continue request ---------------------------------------
  return end(req, NextResponse.next());
}

// --- END helper ---------------------------------------------------
async function end(req: NextRequest, res: NextResponse) {
  const durationMs = getRequestDuration(req.url);
  const pathname = req.nextUrl.pathname;

  // ❗ DO NOT call buildUniversalContext() here.
  // It must run inside the route handler where auth() works.

  await logj(
    "middleware",
    "proxy.ts",
    80,
    {
      level: "info",
      message: "REQUEST END " + pathname,
    },
    {
      durationMs,
      method: req.method,
      url: req.url,
      status: res.status,
    },
    {
      built: null, // middleware cannot build context
    },
  );

  clearRequest(req.url);
  return res;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|auth).*)",
  ],
};
