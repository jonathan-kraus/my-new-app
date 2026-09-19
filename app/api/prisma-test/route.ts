// app/api/prisma-test/route.ts
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";

export async function GET() {
  try {
    const plan = db8.raw.sql`SELECT 1 AS "?column?"`
      .returnsRow({ "?column?": "pg/int4@1" })
      .build();
    const result = await db8.runtime().query(plan);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Prisma test error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
