/*
 * @FilePath: \my-new-app\proxy.ts
 * @LastEditTime: 2026-08-19 12:26:34
 */

import { Logger } from "next-axiom";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import normalizePath from "@/lib/normalizePath";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function proxy(req: NextRequest) {
  //
  // 1. Force www → apex BEFORE anything else
  //
  if (req.nextUrl.hostname === "www.kraus.my.id") {
    const url = req.nextUrl.clone();
    url.hostname = "kraus.my.id";
    return NextResponse.redirect(url);
  }

  //
  // 2. Skip ALL NextAuth routes (signin, callback, session, providers, etc.)
  //    This ensures the OAuth callback is NOT intercepted by session enforcement.
  //
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    console.log("Skipping ALL NextAuth routes");
    return NextResponse.next();
  }

  //
  // 3. Logging start
  //
  const url2 = req.nextUrl.clone();
  const built = await buildUniversalContext(req, "PROXY");

  await logj({
    domain: "PROXY",
    level: "info",
    message: `A1 Start proxy for ${url2.toString()}`,
    file: "proxy.ts",
    line: 50,
    payload: {
      url2: url2.toString(),
      method: req.method,
      nextUrl: req.nextUrl.toString(),
      nextUrlHostname: req.nextUrl.hostname,
      nextUrlPathname: req.nextUrl.pathname,
      nextUrlSearch: req.nextUrl.search,
      nextUrlSearchParams: Object.fromEntries(
        req.nextUrl.searchParams.entries(),
      ),
    },
    meta: {
      built: {
        ...built,
        eventIndex: 1,
      },
    },
  });

  //
  // 4. Skip internal Next.js assets and prefetches
  //
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

  //
  // 5. Scanner detection
  //
  const SCANNER_PATHS = [
    "/telescope",
    "/telescope/requests",
    "/phpmyadmin",
    "/wp-admin",
    "/wp-login.php",
    "/admin",
    "/dashboard",
    "/api/graphql",
    "/server-status",
    "/.env",
    "/vendor/phpunit",
  ];

  function isScannerPath(pathname: string) {
    return SCANNER_PATHS.some((p) => pathname.startsWith(p));
  }

  let domain = "Jonathan";
  if (isScannerPath(pathname)) {
    domain = "Scanner";
  }

  //
  // 6. Normalize path
  //
  const requestStartedAt = Date.now();
  const requestId = crypto.randomUUID();

  const normalizeStartedAt = performance.now();
  const { last, lastTwo: initialLastTwo } = normalizePath(req.url);

  let lastTwo = initialLastTwo;
  if (lastTwo === last) {
    lastTwo = "";
  }

  const normalizeDurationMs = performance.now() - normalizeStartedAt;

  await logj({
    domain: domain,
    level: "info",
    message: `A2 Normalized path ${pathname} in ${normalizeDurationMs.toFixed(3)} ms`,
    file: "proxy.ts",
    line: 126,
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

  //
  // 7. Axiom instrumentation
  //
  const logger = new Logger({ source: "middleware" });
  logger.middleware(req);

  //
  // 8. Session enforcement (ONLY for non-auth routes)
  //
  const session = await auth();

  if (!session) {
    return NextResponse.redirect("https://kraus.my.id/api/auth/signin");
  }

  //
  // 9. Forward headers
  //
  const forwardedHeaders = new Headers(req.headers);

  forwardedHeaders.set("x-app-request-started-at", String(requestStartedAt));
  forwardedHeaders.set("x-app-request-id", requestId);

  return NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  });
}

//
// 10. Matcher — MUST run on ALL paths and ALL hostnames
//
export const config = {
  matcher: ["/:path*"],
};
