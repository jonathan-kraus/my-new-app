// lib/cron/runDbTableStats.ts
//import { sql } from "@/lib/db/neon";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type TableStatRow = {
  table_name: string;
  total_bytes: number | string;
  table_bytes: number | string;
  index_bytes: number | string;
  toast_bytes: number | string;
};

type CountRow = {
  count: number;
};

export async function runDbTableStats(ctx: {
  requestId?: string;
  route?: string;
  userId?: string;
}) {
  const start = Date.now();
  const snapshotDate = atLocalMidnight(new Date());
  const built = staticUniversalContext("runstats");
  let jei = 1;

  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron started",
    file: "lib/cron/runDbTableStats.ts",
    line: 24,
    payload: {
      date: snapshotDate.toISOString(),
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

const stats = (await sql`
  SELECT
    c.relname AS table_name,
    pg_total_relation_size(c.oid) AS total_bytes,
    pg_relation_size(c.oid) AS table_bytes,
    pg_indexes_size(c.oid) AS index_bytes,
    pg_total_relation_size(c.oid)
      - pg_relation_size(c.oid)
      - pg_indexes_size(c.oid) AS toast_bytes
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname = 'public';
`) as TableStatRow[];

  let tablesProcessed = 0;

  for (const row of stats) {
    const tableName = row.table_name;

const countRows = (await sql`
  SELECT COUNT(*)::int AS count
  FROM ${sql.unsafe(`"${tableName.replace(/"/g, `""`)}"`)}
`) as CountRow[];

    const count = countRows[0]?.count ?? 0;

    await logj({
      domain: "jonathan",
      level: "info",
      message:
        "dbTables update started for table " +
        tableName +
        " with " +
        count +
        " rows",
      file: "lib/cron/runDbTableStats.ts",
      line: 58,
      payload: {
        name: tableName,
        count,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    await sql`
      INSERT INTO "DbTableStats" (
        "tableName",
        "snapshotDate",
        "rowEstimate",
        "totalBytes",
        "tableBytes",
        "indexBytes",
        "toastBytes"
      )
      VALUES (
        ${tableName},
        ${snapshotDate.toISOString()},
        ${count},
        ${String(row.total_bytes)},
        ${String(row.table_bytes)},
        ${String(row.index_bytes)},
        ${String(row.toast_bytes)}
      )
      ON CONFLICT ("tableName", "snapshotDate")
      DO UPDATE SET
        "rowEstimate" = EXCLUDED."rowEstimate",
        "totalBytes" = EXCLUDED."totalBytes",
        "tableBytes" = EXCLUDED."tableBytes",
        "indexBytes" = EXCLUDED."indexBytes",
        "toastBytes" = EXCLUDED."toastBytes";
    `;

    tablesProcessed++;
  }

  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron completed",
    file: "lib/cron/runDbTableStats.ts",
    line: 95,
    payload: {
      tables: tablesProcessed,
      durationMs: Date.now() - start,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}