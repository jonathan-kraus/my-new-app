import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { markRequestStart } from "@/lib/log/timing";

let eventCounter = 0;

export async function enrichContext(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  markRequestStart(requestId);

  const page = req.nextUrl.pathname ?? undefined;
  const method = req.method;
  const url = req.url;

  const ip = req.headers.get("x-forwarded-for") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const eventIndex = eventCounter++;

  let sessionEmail: string | undefined = undefined;
  let userId: string | undefined = undefined;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    sessionEmail = session?.user?.email ?? undefined;
    userId = session?.user?.id ?? undefined;
  } catch {}

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
