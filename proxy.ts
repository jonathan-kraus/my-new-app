import { Logger } from "next-axiom";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import normalizePath from "@/lib/normalizePath";

import {
  markRequestStart,
  getRequestDuration,
  getRequestId,
  nextEventIndex,
  clearRequest,
} from "@/lib/log/timing";

import { logit } from "@/lib/log/logit";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // --- 0) Filter out ALL noise -----------------------------------
  const isInternal =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon");
  //pathname.startsWith("/admin") ||
  //pathname.startsWith("/dashboard") ||
  //pathname === "/" ||
  //pathname.startsWith("/logs");

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

  // --- 1) Normalize path segments (you want to keep this) --------
  const { last, lastTwo } = normalizePath(pathname);

  await logit("middleware", {
        level: "info",
        message: "Normalized path segments pathname: " + pathname,
        last,
        lastTwo,
      }, { eventIndex }, {
          requestId: getRequestId(req.url), route: pathname, userId: undefined,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  // --- 2) Start timing -------------------------------------------
  markRequestStart(req.url);
  const logger = new Logger({ source: "middleware" });
  logger.middleware(req);

  // --- 3) Skip NextAuth routes -----------------------------------
  if (pathname.startsWith("/api/auth")) {
    return end(req, NextResponse.next());
  }

  // --- 4) Auth check ---------------------------------------------
  const session = await auth();
  if (!session) {
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
  const { last, lastTwo } = normalizePath(pathname);

  await logit("middleware", {
        level: "info",
        message: "REQUEST END " + pathname,
        page: pathname,
        file: "proxy.ts",
        durationMs,
        method: req.method,
        url: req.url,
        status: res.status,
        requestId: getRequestId(req.url),
        eventIndex: nextEventIndex(req.url),
        last,
        lastTwo,
      }, { eventIndex }, {
          requestId: getRequestId(req.url), route: pathname, userId: undefined,
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });

  clearRequest(req.url);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
