// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/log/app-log"; // your unified logger

export async function proxy(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  logger.setGlobalContext({
    requestId,
    sessionEmail: session?.user?.email ?? null,
    sessionUser: session?.user ?? null,
    userId: session?.user?.id ?? null,
  });

  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);

  const res = NextResponse.next({
    request: { headers },
  });

  res.headers.set("x-request-id", requestId);

  return res;
}
