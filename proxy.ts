// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/log/app-log"; // adjust path if needed

export async function proxy(req: NextRequest) {
  // 1. Request ID
  const requestId = req.headers.get("x-request-id") ?? randomUUID();

  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);

  // 2. Extract session using Better Auth (correct for middleware)
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const email = session?.user?.email ?? null;
  const userId = session?.user?.id ?? null;

  // 3. Set global logger context
  logger.setGlobalContext({
    requestId,
    sessionEmail: email,
    sessionUser: session?.user ?? null,
    userId,
  });

  // 4. Continue request
  const res = NextResponse.next({
    request: { headers },
  });

  res.headers.set("x-request-id", requestId);

  return res;
}
