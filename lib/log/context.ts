// lib/log/context.ts
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function enrichContext(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? null;
  const page = req.nextUrl.pathname;

  let sessionEmail: string | null = null;
  let userId: string | null = null;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    sessionEmail = session?.user?.email ?? null;
    userId = session?.user?.id ?? null;
  } catch {
    // ignore — session is optional
  }

  return {
    requestId,
    page,
    sessionEmail,
    userId,
  };
}
