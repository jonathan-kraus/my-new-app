// lib/cron/runDbTableStats.ts
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/build-universal-context";

const requestId = crypto.randomUUID();
function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function runDbTableStats(ctx: {
  requestId?: string;
  route?: string;
  userId?: string;
}) {
  const start = Date.now();
  const snapshotDate = atLocalMidnight(new Date());
  const built = staticUniversalContext("runstats");
  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron started",
    file: "lib\cron\runDbTableStats.ts",
    line: 19,
    payload: {
      date: snapshotDate.toISOString(),
    },
    meta: {
      built,
    },
  });

  const stats = await db.$queryRawUnsafe(`
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
  `);

  let tablesProcessed = 0;

  for (const row of stats as any[]) {
    // Get exact row count with proper typing
    const result = await db.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*)::int AS count FROM "${row.table_name}"`,
    );

    const count = result[0]?.count ?? 0;

    await db.dbTableStats.upsert({
      where: {
        tableName_snapshotDate: {
          tableName: row.table_name,
          snapshotDate,
        },
      },
      update: {
        rowEstimate: count,
        totalBytes: BigInt(row.total_bytes),
        tableBytes: BigInt(row.table_bytes),
        indexBytes: BigInt(row.index_bytes),
        toastBytes: BigInt(row.toast_bytes),
      },
      create: {
        tableName: row.table_name,
        snapshotDate,
        rowEstimate: count,
        totalBytes: BigInt(row.total_bytes),
        tableBytes: BigInt(row.table_bytes),
        indexBytes: BigInt(row.index_bytes),
        toastBytes: BigInt(row.toast_bytes),
      },
    });

    tablesProcessed++;
  }
  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron completed",
    file: "lib\cron\runDbTableStats.ts",
    line: 86,
    payload: {
      tables: tablesProcessed,
    },
    meta: {
      built,
    },
  });
}
