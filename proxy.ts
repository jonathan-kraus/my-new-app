/*
 * @FilePath: \my-new-app\proxy.ts
 * @LastEditTime: 2026-08-19 00:04:27
 */
import { Logger } from "next-axiom";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import normalizePath from "@/lib/normalizePath";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function proxy(req: NextRequest) {
  // 1. Force www → apex BEFORE anything else runs
  await logj({
    domain: "PROXY",
    level: "info",
    message: "Redirecting unauthenticated user to signin",
    file: "proxy.ts",
    line: 200,
    payload: {
      redirectTo: "https://kraus.my.id/api/auth/signin",
      requestUrl: req.url,
      nextUrl: req.nextUrl.toString(),
    },
  });

  if (req.nextUrl.hostname === "www.kraus.my.id") {
    const url = req.nextUrl.clone();
    url.hostname = "kraus.my.id";
    return NextResponse.redirect(url);
  }
  const url2 = req.nextUrl.clone();
  const built = await buildUniversalContext(req, "PROXY");
  await logj({
    domain: "PROXY",
    level: "info",
    message: `Start proxy for ${url2.toString()}`,
    file: "proxy.ts",
    line: 23,
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

  // Date.now() is safe to forward to a page/route and compare there
  const requestStartedAt = Date.now();
  const requestId = crypto.randomUUID();

  // performance.now() is excellent for a local micro-measurement.
  const normalizeStartedAt = performance.now();

  // normalizePath expects an absolute URL, not "/forecast"
  const { last, lastTwo: initialLastTwo } = normalizePath(req.url);
  let lastTwo = initialLastTwo;
  if (lastTwo === last) {
    lastTwo = "";
  }
  const normalizeDurationMs = performance.now() - normalizeStartedAt;

  await logj({
    domain: domain,
    level: "info",
    message: `Normalized path ${pathname} in ${normalizeDurationMs.toFixed(3)} ms`,
    file: "proxy.ts",
    line: 99,
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
    // IMPORTANT: do NOT use req.url here
    return new NextResponse("Proxy reached this point", { status: 200 });

    // return NextResponse.redirect("https://kraus.my.id/api/auth/signin");
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
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
