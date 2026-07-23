// app/api/db-tables/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertNonEmptyArray } from "@/lib/db/safe";

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

  const results: Array<{
    table_name: string;
    exact_rows: number;
    total_bytes: number;
    table_bytes: number;
    index_bytes: number;
    toast_bytes: number;
  }> = [];

  for (const { table_name } of tables) {
    // Exact row count
    const row = assertNonEmptyArray(
      await db.$queryRawUnsafe<{ exact_count: number }[]>(`
        SELECT COUNT(*)::bigint AS exact_count FROM "${table_name}";
      `),
      `exact count for table ${table_name}`
    )[0];

    const exactCount = row.exact_count;
    console.log(`Table: ${table_name}, Exact Row Count: ${exactCount}`);

    // Size metrics
    const sizes = assertNonEmptyArray(
      await db.$queryRawUnsafe<{
        total_bytes: number;
        table_bytes: number;
        index_bytes: number;
        toast_bytes: number;
      }[]>(`
        SELECT
          pg_total_relation_size('"${table_name}"') AS total_bytes,
          pg_relation_size('"${table_name}"') AS table_bytes,
          pg_indexes_size('"${table_name}"') AS index_bytes,
          pg_total_relation_size('"${table_name}"')
            - pg_relation_size('"${table_name}"')
            - pg_indexes_size('"${table_name}"') AS toast_bytes
      `),
      `sizes for table ${table_name}`
    )[0];

    results.push({
      table_name,
      exact_rows: exactCount,
      ...sizes,
    });
  }

  // Sort by total size descending
  results.sort((a, b) => Number(b.total_bytes) - Number(a.total_bytes));

  return NextResponse.json(sanitizeBigInt(results));
}
