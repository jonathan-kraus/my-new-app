// lib/cron/runDbTableStats.ts
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";

export async function runDbTableStats(ctx: {
  requestId?: string;
  route?: string;
  userId?: string;
}) {
  const start = Date.now();

  await logit(
    "db",
    {
      level: "info",
      message: "dbTables.cron.started",
    },
    ctx,
  );

  const stats = await db.$queryRawUnsafe(`
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
  `);

  let inserted = 0;

  for (const row of stats as any[]) {
    await db.dbTableStats.create({
      data: {
        tableName: row.table_name,
        rowEstimate: Math.round(row.estimated_rows),
        totalBytes: BigInt(row.total_bytes),
        tableBytes: BigInt(row.table_bytes),
        indexBytes: BigInt(row.index_bytes),
        toastBytes: BigInt(row.toast_bytes),
      },
    });
    inserted++;
  }

  await logit(
    "db",
    {
      level: "info",
      message: "dbTables.cron.completed",
      payload: {
        tables: inserted,
        durationMs: Date.now() - start,
      },
    },
    ctx,
  );
}
