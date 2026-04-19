import { Logger } from "next-axiom";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import normalizePath from "@/lib/normalizePath";

import {
  startRequest,
  getDuration,
  nextEventIndex,
  clearRequest,
} from "@/lib/log/timing";

import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

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

  // --- 1) Normalize path segments ---------------------------------
   const normalizedPath = normalizePath(pathname);
   const built = await buildUniversalContext(req, "PROXY");
    await logj({
      domain: 'jonathan',
      level: 'info',
      message: "Normalize path segments pathname: " + normalizedPath,
      file: "proxy.ts",
      line: 41,
      payload: { some: 'data' },
      meta: {
        built,
      },
    });
  // await logit(
  //   "middleware",
  //   {
  //     level: "info",
  //     message: "Normalized path segments pathname: " + pathname,
  //     last,
  //     lastTwo,
  //   },
  //   {},
  //   {

  //     route: pathname,
  //     userId: undefined,
  //     zulu: new Date().toISOString(),
  //     local: new Date().toLocaleString("en-US", {
  //       timeZone: "America/New_York",
  //     }),
  //   },
  // );

  // --- 2) Start timing -------------------------------------------
  startRequest(req.url);
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
  const durationMs = getDuration(req.url);
  const pathname = req.nextUrl.pathname;
  const built = await buildUniversalContext(req, "PROXY");

  // await logj(
  //   "middleware",
  //   "proxy.ts",
  //   90,
  //   {
  //     level: "info",
  //     message: "REQUEST END " + pathname,
  //   },
  //   {
  //     durationMs,
  //     method: req.method,
  //     url: req.url,
  //     status: res.status,
  //   },
  //   {
  //     built: built,
  //   },
  // );

  clearRequest(req.url);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
