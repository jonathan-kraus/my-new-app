// proxy.ts (NextAuth v5 middleware)
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { markRequestStart } from "@/lib/log/timing";

export async function proxy(req: NextRequest) {
  markRequestStart(req.url);

  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/api/private/:path*"],
};
