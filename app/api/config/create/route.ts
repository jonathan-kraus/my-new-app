/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-14 22:01:31
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const response = await axiomIngest("github-events", data);
  return NextResponse.json(response);
}
