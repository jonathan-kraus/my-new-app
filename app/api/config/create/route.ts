/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-15 12:58:57
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const response = await axiomIngest("config_control", data);
  return NextResponse.json(response);
}
