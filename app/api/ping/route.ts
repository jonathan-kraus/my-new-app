// app/api/ping/route.ts - SIMPLE TEST
import { logit } from "@/lib/log/client";
import { NextResponse } from "next/server";

console.log("PING route loaded");
//

export function GET() {
  return NextResponse.json({
    db: process.env.DATABASE_URL ?? "missing",
  });
}
export function Log() {
  //fetch("/api/ping");
  const level = 1;
  logit({
    level: "info",
    message: "ping",
    page: "app/api/ping/route.ts",
    line: 16,
  });
  return level;
}
