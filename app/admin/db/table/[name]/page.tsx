import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { TableDetailView } from "@/components/table-detail-view";
import { TableHistoryChart } from "@/components/table-history-chart";
import { StatCard } from "@/components/stat-card";
import { Rows3, HardDrive, Columns3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { logj } from "@/lib/log/logj";
import { assertNonEmptyArray } from "@/lib/db/safe";
import { staticUniversalContext } from "@/lib/log/buildj";
import {
  getTableDataWithPrisma,
  getTableHistoryWithPrisma,
} from "@/lib/db/prisma-table";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getTableData(name: string, page: number) {
  const built = staticUniversalContext("TablePage");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Fetching table data with Prisma",
    file: "app/admin/db/table/[name]/page.tsx",
    line: 25,
    payload: { name: name, page: page },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const data = await getTableDataWithPrisma(name, page);
  if (!data) {
    return null;
  }

  return {
    ...data,
    totalBytes: 0, // Would need separate query for size info
    indexBytes: 0,
    tableBytes: 0,
  };
}

async function getTableHistory(name: string) {
  return getTableHistoryWithPrisma(name);
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
    "history snapshots",
  );

  const firstSnapshot = rows[0]!.snapshotDate;

  // Convert boxed String → primitive string
  const firstSnapshotStr =
    typeof firstSnapshot === "string"
      ? firstSnapshot
      : firstSnapshot.toString();

  const formattedSnapshot = new Date(firstSnapshotStr).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

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
              <div className="text-sm text-muted-foreground">Tracked Since</div>
              <div className="text-lg font-medium">
                {firstSnapshot
                  ? new Date(formattedSnapshot).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Not yet"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {history.length > 0
                  ? `${history.length} snapshots`
                  : "Take a snapshot"}
              </div>
            </div>
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
