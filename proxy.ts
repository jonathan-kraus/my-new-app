// proxy.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  markRequestStart,
  getRequestDuration,
  getRequestId,
  nextEventIndex,
  clearRequest,
} from "@/lib/log/timing";

import { logit } from "@/lib/log/logit";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1) Start tracking -----------------------------------------
  markRequestStart(req.url);

  // --- 2) Log START ----------------------------------------------
  await logit(
    "middleware",
    {
      level: "info",
      message: "REQUEST START",
      page: pathname,
      file: "proxy.ts",
      data: {
        method: req.method,
        url: req.url,
      },
    },
    {
      requestId: getRequestId(req.url),
      eventIndex: nextEventIndex(req.url),
    }
  );

  // --- 3) Skip internal assets -----------------------------------
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return end(req, NextResponse.next());
  }

  // --- 4) Skip NextAuth routes -----------------------------------
  if (pathname.startsWith("/api/auth")) {
    return end(req, NextResponse.next());
  }

  // --- 5) Auth check ---------------------------------------------
  const session = await auth();
  if (!session) {
    return end(req, NextResponse.redirect(new URL("/api/auth/signin", req.url)));
  }

  // --- 6) Continue request ---------------------------------------
  return end(req, NextResponse.next());
}

// --- END helper ---------------------------------------------------
async function end(req: NextRequest, res: NextResponse) {
  const durationMs = getRequestDuration(req.url);

  await logit(
    "middleware",
    {
      level: "info",
      message: "REQUEST END",
      page: req.nextUrl.pathname,
      file: "proxy.ts",
      durationMs,
      data: {
        url: req.url,
        status: res.status,
      },
    },
    {
      requestId: getRequestId(req.url),
      eventIndex: nextEventIndex(req.url),
    }
  );

  clearRequest(req.url);
  return res;
}

export const config = {
  matcher: ["/notes/:path*", "/api/private/:path*"],
};
