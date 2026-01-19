// app/api/db-tables/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tables = await db.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public';
  `;
  return NextResponse.json(tables);
}
