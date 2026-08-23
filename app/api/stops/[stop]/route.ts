/*
 * @FilePath: \my-new-app\app\api\stops\[stop]\route.ts
 * @LastEditTime: 2026-08-23 15:53:36
 */

import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { stop: string } },
) {
  const url = `https://api-v3.mbta.com/stops/${params.stop}?api_key=${process.env.MBTA_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
