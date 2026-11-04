import { withRequestTiming } from "@/lib/log/with-request-timing";
/*
 * @FilePath: \my-new-app\app\api\travel\next\route.ts
 * @LastEditTime: 2026-02-22 18:21:15
 */
import { NextResponse } from "next/server";
import { getNextTravelEvent } from "@/lib/travel/next-event";

async function GETHandler() {
  const event = await getNextTravelEvent();
  return NextResponse.json({ event });
}

export const GET = withRequestTiming("GET", "/travel/next", GETHandler);
