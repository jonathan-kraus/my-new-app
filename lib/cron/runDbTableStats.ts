import { neon } from "@neondatabase/serverless";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

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
    line: 33,
    payload: { date: snapshotDate.toISOString() },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Fetch table list
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
    const quoted = `"${tableName.replace(/"/g, '""')}"::regclass`;

    // Log BEFORE count query
    await logj({
      domain: "jonathan",
      level: "info",
      message: `dbTables preparing to count rows for table ${tableName}`,
      file: "lib/cron/runDbTableStats.ts",
      line: 66,
      payload: { name: tableName },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    try {
      // COUNT rows
const countRows = await sql`
  SELECT COUNT(*)::int AS count
  FROM ${sql.unsafe(`public."${tableName.replace(/"/g, '""')}"`)}
`;

      const count =
  (await sql`
    SELECT COUNT(*)::int AS count
    FROM ${sql.unsafe(`public."${tableName.replace(/"/g, '""')}"`)}
  `)[0]?.count ?? 0;

      // Log AFTER count query
      await logj({
        domain: "jonathan",
        level: "info",
        message: `dbTables update started for table ${tableName} with ${count} rows`,
        file: "lib/cron/runDbTableStats.ts",
        line: 86,
        payload: { name: tableName, count },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

      // INSERT stats
  await sql`
  INSERT INTO "DbTableStats" (
    "tableName",
    "snapshotDate",
    "rowEstimate",
    "totalBytes",
    "tableBytes",
    "indexBytes",
    "toastBytes",
    "createdAt"
  )
  VALUES (
    ${tableName},
    ${snapshotDate.toISOString()},
    ${count},
    ${BigInt(row.total_bytes)},
    ${BigInt(row.table_bytes)},
    ${BigInt(row.index_bytes)},
    ${BigInt(row.toast_bytes)},
    ${new Date().toISOString()}
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
    } catch (err: any) {
      // Log per-table error
      await logj({
        domain: "jonathan",
        level: "error",
        message: `dbTables error for table ${tableName}`,
        file: "lib/cron/runDbTableStats.ts",
        line: 128,
        payload: { error: String(err), name: tableName },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

      // Continue to next table instead of aborting cron
      continue;
    }
  }

  // Final completion log
  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron completed",
    file: "lib/cron/runDbTableStats.ts",
    line: 144,
    payload: {
      tables: tablesProcessed,
      durationMs: Date.now() - start,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}
