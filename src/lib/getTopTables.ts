/*
 * @FilePath: \my-new-app\src\lib\getTopTables.ts
 * @LastEditTime: 2026-09-07 22:03:01
 */
import { db } from "@/lib/db";

export async function getTopTables() {
  const rows = await db.$queryRawUnsafe<
    {
      table_name: string;
      estimated_rows: number;
    }[]
  >(`
    SELECT
      c.relname AS table_name,
      c.reltuples AS estimated_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
    ORDER BY c.reltuples DESC
    LIMIT 5;
  `);
  console.log("getTopTables rows:", rows);
  return rows.map((r) => ({
    name: r.table_name,
    count: Math.round(r.estimated_rows),
  }));
}
