import { neon } from "@neondatabase/serverless";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { db8 } from "@/lib/db.prisma8";
import { timestampString } from "@/lib/timestampString";
import { createId } from "@paralleldrive/cuid2";

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

export async function runDbTableStats(ctx: {
  requestId?: string;
  route?: string;
  userId?: string;
}) {
  const start = Date.now();

  // JavaScript Date for normal application/logging use
  const snapshotDate = atLocalMidnight(new Date());

  // Prisma 8 DbTableStats.snapshotDate is TimestampString(3)
  const snapshotDate8 = timestampString(snapshotDate.toISOString());

  const built = staticUniversalContext("runstats");
  let jei = 1;

  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron started",
    file: "lib/cron/runDbTableStats.ts",
    line: 34,
    payload: {
      date: snapshotDate.toISOString(),
    },
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

    await logj({
      domain: "jonathan",
      level: "info",
      message: `dbTables preparing to count rows for table ${tableName}`,
      file: "lib/cron/runDbTableStats.ts",
      line: 67,
      payload: {
        name: tableName,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    try {
      // COUNT rows
      const count =
        (
          await sql`
            SELECT COUNT(*)::int AS count
            FROM ${sql.unsafe(
              `public."${tableName.replace(/"/g, '""')}"`,
            )}
          `
        )[0]?.count ?? 0;

      await logj({
        domain: "jonathan",
        level: "info",
        message: `dbTables update started for table ${tableName} with ${count} rows`,
        file: "lib/cron/runDbTableStats.ts",
        line: 93,
        payload: {
          name: tableName,
          count,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

      // Find today's existing snapshot for this table
      const existing = await db8.orm.public.DbTableStats
        .where((stat) => stat.tableName.eq(row.table_name))
        .where((stat) => stat.snapshotDate.eq(snapshotDate8))
        .first();

      const values = {
        tableName: row.table_name,
        snapshotDate: snapshotDate8,
        rowEstimate: count,
        totalBytes: BigInt(row.total_bytes),
        tableBytes: BigInt(row.table_bytes),
        indexBytes: BigInt(row.index_bytes),
        toastBytes: BigInt(row.toast_bytes),
      };

      if (existing) {
        await db8.orm.public.DbTableStats
          .where({ id: existing.id })
          .update(values);
      } else {
        await db8.orm.public.DbTableStats.create({
          id: createId(),
          ...values,
        });
      }

      tablesProcessed++;
    } catch (err: any) {
      await logj({
        domain: "jonathan",
        level: "error",
        message: `dbTables error for table ${tableName}`,
        file: "lib/cron/runDbTableStats.ts",
        line: 132,
        payload: {
          error: String(err),
          name: tableName,
        },
        meta: { built: { ...built, eventIndex: ++jei } },
      });

      // Continue to next table instead of aborting cron
      continue;
    }
  }

  await logj({
    domain: "jonathan",
    level: "info",
    message: "dbTables cron completed",
    file: "lib/cron/runDbTableStats.ts",
    line: 148,
    payload: {
      tables: tablesProcessed,
      durationMs: Date.now() - start,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}
