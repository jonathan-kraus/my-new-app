/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-15 17:57:22
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const response = await axiomIngest(data);
  console.log("AXIOM INGEST RESPONSE", response);
  return NextResponse.json(response);
}
