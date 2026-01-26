// proxy.ts — unified middleware with auth, timing, 404s, and structured logging

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { markRequestStart, getRequestDuration } from "@/lib/log/timing";
import { logit } from "@/lib/log/logit";

import manifest from "../.next/server/middleware-manifest.json";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1) Mark request start -------------------------------------
  markRequestStart(req.url);

  // --- 2) Log START event ----------------------------------------
  await logit({
    level: "info",
    message: "REQUEST START",
    page: pathname,
    file: "middleware",
    data: {
      method: req.method,
      url: req.url,
    },
  });

  // --- 3) Skip internal Next.js assets ---------------------------
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return end(req, NextResponse.next());
  }

  // --- 4) Skip NextAuth routes -----------------------------------
  if (pathname.startsWith("/api/auth")) {
    return end(req, NextResponse.next());
  }

  // --- 5) 404 detection using manifest ----------------------------
  const knownRoutes = [
    ...Object.keys(manifest.pages || {}),
    ...Object.keys(manifest.functions || {}),
  ];

  const exists = knownRoutes.some((route) => {
    if (route === pathname) return true;

    if (route.includes("[")) {
      const regex = new RegExp("^" + route.replace(/

\[.*?\]

/g, "[^/]+") + "$");
      return regex.test(pathname);
    }

    return false;
  });

  if (!exists) {
    return end(req, NextResponse.rewrite(new URL("/not-found", req.url)));
  }

  // --- 6) Auth protection for private areas -----------------------
  const session = await auth();

  if (!session) {
    return end(req, NextResponse.redirect(new URL("/api/auth/signin", req.url)));
  }

  // --- 7) Allow request to continue -------------------------------
  return end(req, NextResponse.next());
}

// --- Helper: log END event with duration --------------------------
async function end(req: NextRequest, res: NextResponse) {
  const durationMs = getRequestDuration(req.url);

  await logit({
    level: "info",
    message: "REQUEST END",
    page: req.nextUrl.pathname,
    file: "middleware",
    durationMs,
    data: {
      url: req.url,
      status: res.status,
    },
  });

  return res;
}

export const config = {
  matcher: ["/notes/:path*", "/api/private/:path*"],
};
