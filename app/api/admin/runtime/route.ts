/*
 * @FilePath: \my-new-app\app\api\admin\runtime\route.ts
 * @LastEditTime: 2026-08-06 14:43:48
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const configs = await db.runtimeConfig.findMany({ orderBy: { key: "asc" } });
  console.log(configs);
  return NextResponse.json({
    configs: configs.map((c) => ({ key: c.key, value: c.value })),
  });
}
