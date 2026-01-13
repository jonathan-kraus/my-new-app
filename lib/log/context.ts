// lib/log/context.ts
import type { NextRequest } from "next/server";

export function contextFromRequest(req: NextRequest) {
  return {
    requestId: req.headers.get("x-request-id") ?? null,
    page: req.nextUrl.pathname,
  };
}
