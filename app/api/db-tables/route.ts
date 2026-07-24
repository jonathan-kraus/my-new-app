/*
 * @FilePath: \my-new-app\app\api\db-tables\route.ts
 * @LastEditTime: 2026-07-24 00:49:48
 */
import { neon } from "@neondatabase/serverless";

const db = neon(process.env.DATABASE_URL!);

export async function GET() {
  const tables = await db`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name ASC
  ` as { table_name: string }[];

  const results = [];

  for (const { table_name } of tables) {
    // Safe identifier quoting
    const quoted = `"${table_name.replace(/"/g, '""')}"`;

    // Count rows
    const countRows = await db`
      SELECT COUNT(*)::int AS exact_count
      FROM ${quoted}
    ` as { exact_count: number }[];

    const { exact_count } = countRows[0]!;

    // Size metrics
    const sizeRows = await db`
      SELECT
        pg_total_relation_size(${quoted}) AS total_bytes,
        pg_indexes_size(${quoted}) AS index_bytes,
        pg_total_relation_size(${quoted}::regclass)
          - pg_relation_size(${quoted})
          - pg_indexes_size(${quoted}) AS toast_bytes
    ` as {
      total_bytes: number;
      index_bytes: number;
      toast_bytes: number;
    }[];

    const { total_bytes, index_bytes, toast_bytes } = sizeRows[0]!;

    results.push({
      name: table_name,
      exact_count,
      sizes: {
        total_bytes,
        index_bytes,
        toast_bytes,
      },
    });
  }

  return Response.json(results);
}
