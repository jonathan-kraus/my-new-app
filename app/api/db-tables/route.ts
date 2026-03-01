// app/api/db-tables/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function sanitizeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v)),
  );
}

export async function GET() {
  // Fetch all table names in the public schema
  const tables = await db.$queryRawUnsafe<{ table_name: string }[]>(`
    SELECT tablename AS table_name
    FROM pg_tables
    WHERE schemaname = 'public';
  `);

  const results = [];

  for (const { table_name } of tables) {
    // Exact row count
    const [{ exact_count }] = await db.$queryRawUnsafe<
      { exact_count: number }[]
    >(`
      SELECT COUNT(*)::bigint AS exact_count FROM "${table_name}";
    `);

    // Size metrics
    const [sizes] = await db.$queryRawUnsafe<any[]>(`
      SELECT
        pg_total_relation_size('"${table_name}"') AS total_bytes,
        pg_relation_size('"${table_name}"') AS table_bytes,
        pg_indexes_size('"${table_name}"') AS index_bytes,
        pg_total_relation_size('"${table_name}"')
          - pg_relation_size('"${table_name}"')
          - pg_indexes_size('"${table_name}"') AS toast_bytes
    `);

    results.push({
      table_name,
      exact_rows: exact_count,
      ...sizes,
    });
  }

  // Sort by total size descending
  results.sort((a, b) => Number(b.total_bytes) - Number(a.total_bytes));

  return NextResponse.json(sanitizeBigInt(results));
}
