import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { markRequestStart } from "@/lib/log/timing";

let eventCounter = 0;

export async function enrichContext(req: NextRequest) {
  // Use the forwarded requestId from middleware
  const requestId = req.headers.get("x-request-id") ?? null;

  // Start timing *inside* the API route execution context
  if (requestId) {
    markRequestStart(requestId);
  }

  // Basic request metadata
  const page = req.nextUrl.pathname;
  const method = req.method;
  const url = req.url;
  const ip = req.headers.get("x-forwarded-for") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  // Increment per-request event index
  const eventIndex = eventCounter++;

  // Session info
  let sessionEmail: string | null = null;
  let userId: string | null = null;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    sessionEmail = session?.user?.email ?? null;
    userId = session?.user?.id ?? null;
  } catch {
    // session is optional
  }

  return {
    requestId,
    eventIndex,
    page,
    method,
    url,
    ip,
    userAgent,
    sessionEmail,
    userId,
  };
}
