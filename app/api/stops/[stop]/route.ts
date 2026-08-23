/*
 * @FilePath: \my-new-app\app\api\stops\[stop]\route.ts
 * @LastEditTime: 2026-08-23 16:11:11
 */

import { NextResponse } from "next/server";
console.log("*api/stops/[stop]/route.ts loaded");
export async function GET(
  _req: Request,
  { params }: { params: { stop: string } },
) {
  const url = `https://api-v3.mbta.com/stops/${params.stop}?api_key=${process.env.MBTA_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  console.log("Stop details:", JSON.stringify(data, null, 2));

  return NextResponse.json(data);
}
