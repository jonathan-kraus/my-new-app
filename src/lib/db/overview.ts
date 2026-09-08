import { sql, excludeTables } from "@/lib/db/utils";

export async function getOverview() {
  const stats = await sql`
    SELECT
      c.relname AS table_name,
      c.reltuples::bigint AS row_estimate,
      pg_total_relation_size(c.oid) AS total_bytes,
      pg_indexes_size(c.oid) AS index_bytes,
      pg_relation_size(c.oid) AS table_bytes,
      COALESCE(pg_total_relation_size(c.reltoastrelid), 0) AS toast_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `;

  const columns = await sql`
    SELECT table_name, COUNT(*)::int AS column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
  `;

  const columnMap = Object.fromEntries(
    columns.map((c) => [c.table_name, c.column_count]),
  );

  return stats
    .filter((s) => !excludeTables.includes(s.table_name))
    .map((s) => ({
      name: s.table_name,
      rowEstimate: Number(s.row_estimate),
      totalBytes: Number(s.total_bytes),
      indexBytes: Number(s.index_bytes),
      tableBytes: Number(s.table_bytes),
      toastBytes: Number(s.toast_bytes),
      columnCount: columnMap[s.table_name] || 0,
    }));
}

export async function getHistory() {
  const history = await sql`
    SELECT
      "tableName",
      "rowEstimate",
      "totalBytes",
      "indexBytes",
      "tableBytes",
      "toastBytes",
      "snapshotDate"
    FROM "DbTableStats"
    WHERE "snapshotDate" >= NOW() - INTERVAL '30 days'
    ORDER BY "snapshotDate" ASC
  `;

  return history.map((h) => ({
    tableName: h.tableName as string,
    rowEstimate: Number(h.rowEstimate),
    totalBytes: Number(h.totalBytes),
    indexBytes: Number(h.indexBytes),
    tableBytes: Number(h.tableBytes),
    toastBytes: Number(h.toastBytes),
    snapshotDate: h.snapshotDate as string,
  }));
}
