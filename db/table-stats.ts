// db/table-stats.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type TableStat = {
  table_name: string;
  total_bytes: number;
  table_bytes: number;
  index_bytes: number;
  toast_bytes: number;
  estimated_rows: number;
};

export async function getTableStats(): Promise<TableStat[]> {
  const rows = await sql`
    SELECT
      c.relname AS table_name,
      pg_total_relation_size(c.oid) AS total_bytes,
      pg_relation_size(c.oid) AS table_bytes,
      pg_indexes_size(c.oid) AS index_bytes,
      pg_total_relation_size(c.oid)
        - pg_relation_size(c.oid)
        - pg_indexes_size(c.oid) AS toast_bytes,
      c.reltuples AS estimated_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public';
  `;

  return rows as TableStat[];
}
