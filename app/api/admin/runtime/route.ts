import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const configs = await db.runtimeConfig.findMany({ orderBy: { key: "asc" } });

  return NextResponse.json({
    configs: configs.map((c) => ({ key: c.key, value: c.value })),
  });
}
