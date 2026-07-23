/*
 * @FilePath: \my-new-app\app\api\ephemeris\route.ts
 * @LastEditTime: 2026-07-23 02:32:57
 */
import { NextResponse } from "next/server";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const loc = searchParams.get("loc") ?? "KOP";

  const snapshot = await getEphemerisSnapshot(loc);
  return NextResponse.json(snapshot);
}
