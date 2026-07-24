import { sql, excludeTables } from "@/lib/db/utils";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { TableDetailView } from "@/components/table-detail-view";
import { TableHistoryChart } from "@/components/table-history-chart";
import { StatCard } from "@/components/stat-card";
import { Rows3, HardDrive, Columns3 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { logj } from "@/lib/log/logj";
import { assertNonEmptyArray, firstRow } from "@/lib/db/safe";
import { staticUniversalContext } from "@/lib/log/buildj";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getTableData(name: string, page: number) {
  // Validate table exists and is not excluded
  const built = staticUniversalContext("TablePage");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Validating Table existence",
    file: "page.tsx",
    line: 24,
    payload: { name: name, page: page },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const tableCheck = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
  `;
  if (tableCheck.length === 0 || excludeTables.includes(name)) {
    return null;
  }

  const columns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${name}
    ORDER BY ordinal_position
  `;

  const countResult = await sql.query(
    `SELECT COUNT(*)::int AS count FROM "${name}"`,
  );
  const row = firstRow(countResult, `count query for table ${name}`);
  const totalRows = row.count ?? 0;

  const limit = 50;
  const offset = (page - 1) * limit;

  // Try to order by common columns
  let orderCol = columns[0]?.column_name || "id";
  const hasCreatedAt = columns.some(
    (c) =>
      c.column_name === "createdAt" ||
      c.column_name === "created_at" ||
      c.column_name === "fetchedAt",
  );
  if (hasCreatedAt) {
    const col = columns.find(
      (c) =>
        c.column_name === "createdAt" ||
        c.column_name === "created_at" ||
        c.column_name === "fetchedAt",
    );
    if (col) orderCol = col.column_name;
  }

  const rows = await sql.query(
    `SELECT * FROM "${name}" ORDER BY "${orderCol}" DESC LIMIT ${limit} OFFSET ${offset}`,
  );

  // Get size info
  const sizeResult = await sql`
    SELECT
      pg_total_relation_size(c.oid) AS total_bytes,
      pg_indexes_size(c.oid) AS index_bytes,
      pg_relation_size(c.oid) AS table_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = ${name}
  `;

  return {
    name,
    columns: columns.map((c) => ({
      name: c.column_name as string,
      type: c.data_type as string,
      nullable: c.is_nullable === "YES",
    })),
    rows,
    totalRows,
    page,
    limit,
    totalPages: Math.ceil(totalRows / limit),
    totalBytes: Number(sizeResult[0]?.total_bytes || 0),
    indexBytes: Number(sizeResult[0]?.index_bytes || 0),
    tableBytes: Number(sizeResult[0]?.table_bytes || 0),
  };
}

async function getTableHistory(name: string) {
  const history = await sql`
    SELECT "tableName", "rowEstimate", "totalBytes", "indexBytes", "tableBytes", "toastBytes", "snapshotDate"
    FROM "DbTableStats"
    WHERE "tableName" = ${name}
      AND "snapshotDate" >= NOW() - INTERVAL '30 days'
    ORDER BY "snapshotDate" ASC
  `;

  return history.map((h) => ({
    tableName: h.tableName as string,
    rowEstimate: Number(h.rowEstimate),
    totalBytes: Number(h.totalBytes),
    snapshotDate: h.snapshotDate as string,
  }));
}

export default async function TablePage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");

  const [tableData, history] = await Promise.all([
    getTableData(name, page),
    getTableHistory(name),
  ]);

  if (!tableData) {
    notFound();
  }

  // Find first and last snapshot dates
const rows = assertNonEmptyArray(
  history as Array<{ snapshotDate: String }>,
  "history snapshots"
);

const firstSnapshot = rows[0]!.snapshotDate;

// Convert boxed String → primitive string
const firstSnapshotStr = typeof firstSnapshot === "string"
  ? firstSnapshot
  : firstSnapshot.toString();

const formattedSnapshot = new Date(firstSnapshotStr).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});


  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin/db"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to overview
            </Link>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono text-foreground">
              {tableData.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tableData.totalRows.toLocaleString()} rows across{" "}
              {tableData.columns.length} columns
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Rows"
              value={tableData.totalRows}
              subtitle="Exact count"
              icon={Rows3}
            />
            <StatCard
              title="Total Size"
              value={tableData.totalBytes}
              subtitle="Data + indexes"
              icon={HardDrive}
            />
            <StatCard
              title="Columns"
              value={tableData.columns.length}
              icon={Columns3}
            />
            <div className="rounded-lg border p-4">
              {" "}
              <div className="text-sm text-muted-foreground">
                Tracked Since
              </div>{" "}
              <div className="text-lg font-medium">
                {" "}
                {firstSnapshot
                  ? new Date(formattedSnapshot).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Not yet"}{" "}
              </div>{" "}
            </div>
            subtitle=
            {history.length > 0
              ? `${history.length} snapshots`
              : "Take a snapshot"}
          </div>

          {/* History charts */}
          <TableHistoryChart history={history} tableName={name} />

          {/* Data table */}
          <TableDetailView
            name={tableData.name}
            columns={tableData.columns}
            rows={tableData.rows}
            totalRows={tableData.totalRows}
            page={tableData.page}
            totalPages={tableData.totalPages}
          />
        </div>
      </main>
    </div>
  );
}
