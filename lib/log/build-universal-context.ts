import crypto from "crypto";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(route: string) {
  const now = new Date();

  try {
    // Normalize headers() across environments (sync vs async)
    const h = (await Promise.resolve(headers())) as {
      get: (name: string) => string | null;
      entries: () => Iterable<[string, string]>;
    };

    // Convert ReadonlyHeaders → plain object for NextRequest
    const plainHeaders = Object.fromEntries(h.entries()) as Record<string, string>;

    // Build a real NextRequest so enrichContext receives the expected type
    const req = new NextRequest("http://local", { headers: plainHeaders });

    // NextAuth v5 session extraction
    let session = null;
    try {
      session = await auth({ headers: plainHeaders } as any);
    } catch {
      session = await auth();
    }

    const userId = session?.user?.id ?? null;

    // Your existing context enrichment
    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId,
      sessionEmail: session?.user?.email ?? null,
      sessionUser: session?.user?.name ?? null,
      route,
    };
  } catch {
    // Fallback for pages or client-contaminated files
    return {
      ip: null,
      url: null,
      requestId: crypto.randomUUID(),
      method: "UNKNOWN",
      route,
      userId: null,
      sessionEmail: null,
      sessionUser: null,
      zulu: now.toISOString(),
      local: now.toLocaleString(),
      runtime: {
        node: process.version,
        region: process.env.VERCEL_REGION ?? "local",
      },
    };
  }
}
