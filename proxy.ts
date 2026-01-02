// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export function proxy(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();

  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);

  const res = NextResponse.next({
    request: { headers },
  });

  res.headers.set("x-request-id", requestId);

  return res;
}
