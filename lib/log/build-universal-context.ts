import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { enrichContext } from "./context";

export async function buildUniversalContext(route: string) {
  const now = new Date();

  try {
    // Resolve headers() and cookies() whether they return a value or a Promise
    const h = (await Promise.resolve(headers())) as {
      get: (name: string) => string | null;
      entries: () => Iterable<[string, string]>;
    };

    // Convert ReadonlyHeaders to a plain object suitable for NextRequest init
    const plainHeaders = Object.fromEntries(h.entries()) as Record<
      string,
      string
    >;

    // Build a real NextRequest so enrichContext receives the expected type
    const req = new NextRequest("http://local", { headers: plainHeaders });

    // Try to get session passing headers if your auth supports it; fall back to calling auth()
    let session = null;
    try {
      // If your auth function accepts an options object, this will work.
      // Cast to any to avoid strict typing issues if your auth signature differs.
      session = await auth({ headers: plainHeaders } as any);
    } catch {
      // Fallback: call auth() without args (works if auth is callable and returns a session)
      session = await auth();
    }

    const userId = session?.user?.id ?? null;

    const ctx = await enrichContext(req);

    return {
      ...ctx,
      requestId: ctx.requestId ?? crypto.randomUUID(),
      userId,
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
      userId: "JK",
      zulu: now.toISOString(),
      local: now.toLocaleString(),
      runtime: {
        node: process.version,
        region: process.env.VERCEL_REGION ?? "local",
      },
    };
  }
}
