/*
 * @FilePath: \my-new-app\src\lib\getTopTables.ts
 * @LastEditTime: 2026-09-07 22:03:01
 */
import { db8 } from "@/lib/db.prisma8";

export async function getTopTables() {
  const plan = db8.raw.sql`
    SELECT
      c.relname::text AS table_name,
      c.reltuples::double precision AS estimated_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
    ORDER BY c.reltuples DESC
    LIMIT 5;
  `
    .returnsRow({
      table_name: "pg/text@1",
      estimated_rows: "pg/float8@1",
    })
    .build();
  const rows = await db8.runtime().query(plan);
  console.log("getTopTables rows:", rows);
  return rows.map((r) => ({
    name: r.table_name,
    count: Math.round(r.estimated_rows),
  }));
}
