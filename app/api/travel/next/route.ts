/*
 * @FilePath: \my-new-app\app\api\travel\next\route.ts
 * @LastEditTime: 2026-02-22 18:21:15
 */
import { NextResponse } from "next/server";
import { getNextTravelEvent } from "@/lib/travel/next-event";

export async function GET() {
  const event = await getNextTravelEvent();
  return NextResponse.json({ event });
}
