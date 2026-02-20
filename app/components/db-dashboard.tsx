"use client";
/*
 * @FilePath     : \my-new-app\app\components\db-dashboard.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-19 18:12:14
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-19 22:46:52
 */
import { DashboardHeader } from "./dashboard-header";
import { StatCard } from "./stat-card";
import { TableList } from "./table-list";
import { GrowthChart } from "./growth-chart";
import { TableGrowthChart } from "./table-growth-chart";
import { SnapshotButton } from "./snapshot-button";
import { Database, Rows3, HardDrive, Columns3 } from "lucide-react";

type DbDashboardProps = {
  tables: {
    name: string;
    rowEstimate: number;
    totalBytes: number;
    columnCount: number;
  }[];
  history: any[];
};

export function DbDashboard({ tables, history }: DbDashboardProps) {
  const totalTables = tables.length;
  const totalRows = tables.reduce((acc, t) => acc + t.rowEstimate, 0);
  const totalBytes = tables.reduce((acc, t) => acc + t.totalBytes, 0);
  const totalColumns = tables.reduce((acc, t) => acc + t.columnCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Database Overview
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoring {totalTables} tables
              </p>
            </div>
            <SnapshotButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard title="Tables" value={totalTables} icon={Database} />{" "}
            <StatCard title="Total Rows" value={totalRows} icon={Rows3} />{" "}
            <StatCard
              title="Total Size"
              value={totalBytes}
              format="bytes"
              icon={HardDrive}
            />{" "}
            <StatCard
              title="Total Columns"
              value={totalColumns}
              icon={Columns3}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GrowthChart
              history={history}
              title="Total Row Growth"
              description="Combined row count across all tables"
              dataKey="rowEstimate"
            />
            <GrowthChart
              history={history}
              title="Storage Growth"
              description="Combined storage usage across all tables"
              dataKey="totalBytes"
            />
          </div>

          {/* Distribution */}
          <TableGrowthChart
            history={history}
            tables={tables.map((t) => t.name)}
          />

          {/* Table list */}
          <TableList tables={tables} />
        </div>
      </main>
    </div>
  );
}
