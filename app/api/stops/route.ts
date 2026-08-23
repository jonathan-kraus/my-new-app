/*
 * @FilePath: \my-new-app\app\api\stops\route.ts
 * @LastEditTime: 2026-08-22 20:15:40
 */

import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://api-v3.mbta.com/stops?api_key=${process.env.MBTA_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
