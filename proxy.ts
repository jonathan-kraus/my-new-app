// middleware.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export function middleware(req: Request) {
  const requestId = randomUUID();

  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);

  return res;
}
