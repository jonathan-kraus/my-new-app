// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { markRequestStart } from "@/lib/log/timing";

export function proxy(req: NextRequest) {
  const requestId = crypto.randomUUID();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);

  // Start timing
  markRequestStart(requestId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
