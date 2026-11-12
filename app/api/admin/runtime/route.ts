/*
 * @FilePath: \my-new-app\app\api\admin\runtime\route.ts
 * @LastEditTime: 2026-09-15 01:59:53
 */
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { withRequestTiming } from "@/lib/log/with-request-timing";
import { RuntimeAccessError, requireRuntimeAdmin } from "@/lib/runtime/admin";

async function GETHandler() {
  try {
    await requireRuntimeAdmin();
  } catch (error) {
    if (error instanceof RuntimeAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
  const configs = await db8.orm.public.RuntimeConfig.orderBy((config) =>
    config.key.asc(),
  ).all();

  return NextResponse.json({
    configs: configs.map((c) => ({ key: c.key, value: c.value })),
  });
}

export const GET = withRequestTiming("GET", "/admin/runtime", GETHandler);
