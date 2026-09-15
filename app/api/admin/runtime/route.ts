/*
 * @FilePath: \my-new-app\app\api\admin\runtime\route.ts
 * @LastEditTime: 2026-09-15 01:59:53
 */
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";

export async function GET() {
  const configs = await db8.orm.public.RuntimeConfig.orderBy((config) =>
    config.key.asc(),
  ).all();

  console.log(configs);

  return NextResponse.json({
    configs: configs.map((c) => ({ key: c.key, value: c.value })),
  });
}
