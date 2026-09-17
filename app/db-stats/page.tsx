/*
 * @FilePath: \my-new-app\app\db-stats\page.tsx
 * @LastEditTime: 2026-09-17 17:53:00
 */
"use client";

import { useEffect, useMemo, useState } from "react";

type DbStat = {
  id: string;
  tableName: string;
  rowEstimate: number;
  totalBytes: number;
  indexBytes: number;
  tableBytes: number;
  toastBytes: number;
  snapshotDate: string;
  createdAt: string;
  deltaRows: number;
  deltaBytes: number;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.abs(bytes);
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }

  const sign = bytes < 0 ? "-" : "";

  return `${sign}${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function deltaClass(value: number) {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-rose-400";
  return "text-zinc-400";
}

function SizeChart({ rows }: { rows: DbStat[] }) {
  if (rows.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Not enough history yet
      </div>
    );
  }

  const width = 900;
  const height = 280;

  const padding = {
    top: 20,
    right: 25,
    bottom: 50,
    left: 75,
  };

  const values = rows.map((row) => Number(row.totalBytes));

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) =>
    padding.left + (index / Math.max(rows.length - 1, 1)) * chartWidth;

  const getY = (value: number) =>
    padding.top + (1 - (value - min) / range) * chartHeight;

  const points = rows
    .map((row, index) => {
      return `${getX(index)},${getY(Number(row.totalBytes))}`;
    })
    .join(" ");

  // 5 horizontal labels/grid lines
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = max - range * ratio;

    return {
      value,
      y: padding.top + chartHeight * ratio,
    };
  });

  // Show roughly 5 date labels across the bottom
  const xIndexes = Array.from(
    new Set([
      0,
      Math.round((rows.length - 1) * 0.25),
      Math.round((rows.length - 1) * 0.5),
      Math.round((rows.length - 1) * 0.75),
      rows.length - 1,
    ]),
  );

  const formatChartDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {/* Horizontal grid lines + Y labels */}
        {yTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={tick.y}
              y2={tick.y}
              className="stroke-zinc-800"
              strokeWidth="1"
            />

            <text
              x={padding.left - 12}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-zinc-500 text-[11px]"
            >
              {formatBytes(tick.value)}
            </text>
          </g>
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          className="stroke-zinc-700"
        />

        {/* Date labels */}
        {xIndexes.map((index) => (
          <g key={index}>
            <line
              x1={getX(index)}
              x2={getX(index)}
              y1={height - padding.bottom}
              y2={height - padding.bottom + 5}
              className="stroke-zinc-600"
            />

            <text
              x={getX(index)}
              y={height - 20}
              textAnchor="middle"
              className="fill-zinc-500 text-[11px]"
            >
              {formatChartDate(rows[index]!.snapshotDate)}
            </text>
          </g>
        ))}

        {/* Storage line */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-sky-400"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Snapshot points */}
        {rows.map((row, index) => (
          <circle
            key={row.id}
            cx={getX(index)}
            cy={getY(Number(row.totalBytes))}
            r="3"
            className="fill-sky-400"
          />
        ))}

        {/* Axis titles */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 2}
          textAnchor="middle"
          className="fill-zinc-600 text-[11px]"
        >
          Snapshot date
        </text>

        <text
          x="15"
          y={padding.top + chartHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 15 ${padding.top + chartHeight / 2})`}
          className="fill-zinc-600 text-[11px]"
        >
          Total storage
        </text>
      </svg>
    </div>
  );
}

export default function DbStatsPage() {
  const [rows, setRows] = useState<DbStat[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/db-stats/history", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data: DbStat[] = await response.json();

        setRows(data);

        if (data.length > 0) {
          const names = [...new Set(data.map((row) => row.tableName))].sort();
          setSelectedTable(
            (current) =>
              current || (names.includes("Log") ? "Log" : names[0] || ""),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load DB stats",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const latestByTable = useMemo(() => {
    const latest = new Map<string, DbStat>();

    for (const row of rows) {
      const current = latest.get(row.tableName);

      if (
        !current ||
        new Date(row.snapshotDate).getTime() >
          new Date(current.snapshotDate).getTime()
      ) {
        latest.set(row.tableName, row);
      }
    }

    return [...latest.values()].sort(
      (a, b) => Number(b.totalBytes) - Number(a.totalBytes),
    );
  }, [rows]);

  const tableNames = useMemo(
    () => latestByTable.map((row) => row.tableName).sort(),
    [latestByTable],
  );

  const selectedRows = useMemo(
    () =>
      rows
        .filter((row) => row.tableName === selectedTable)
        .sort(
          (a, b) =>
            new Date(a.snapshotDate).getTime() -
            new Date(b.snapshotDate).getTime(),
        ),
    [rows, selectedTable],
  );

  const selectedLatest = selectedRows.at(-1);

  const totalBytes = latestByTable.reduce(
    (sum, row) => sum + Number(row.totalBytes),
    0,
  );

  const totalRows = latestByTable.reduce(
    (sum, row) => sum + Number(row.rowEstimate),
    0,
  );

  const biggestTable = latestByTable[0];

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            Loading database statistics…
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-8 text-rose-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
            Database
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Storage & Table History
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Neon PostgreSQL table growth, row estimates, indexes and historical
            changes.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tables tracked"
            value={formatNumber(latestByTable.length)}
          />

          <StatCard label="Estimated rows" value={formatNumber(totalRows)} />

          <StatCard label="Current storage" value={formatBytes(totalBytes)} />

          <StatCard
            label="Largest table"
            value={biggestTable?.tableName ?? "—"}
            detail={
              biggestTable
                ? formatBytes(Number(biggestTable.totalBytes))
                : undefined
            }
          />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Table history</h2>
              <p className="text-sm text-zinc-500">
                Storage growth over recorded snapshots
              </p>
            </div>

            <select
              value={selectedTable}
              onChange={(event) => setSelectedTable(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500"
            >
              {tableNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedLatest && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniStat
                label="Rows"
                value={formatNumber(selectedLatest.rowEstimate)}
              />

              <MiniStat
                label="Total"
                value={formatBytes(Number(selectedLatest.totalBytes))}
              />

              <MiniStat
                label="Indexes"
                value={formatBytes(Number(selectedLatest.indexBytes))}
              />

              <MiniStat
                label="TOAST"
                value={formatBytes(Number(selectedLatest.toastBytes))}
              />
            </div>
          )}

          <SizeChart rows={selectedRows} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Latest table statistics</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/70 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Table</th>
                  <th className="px-5 py-3 text-right">Rows</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Table</th>
                  <th className="px-5 py-3 text-right">Indexes</th>
                  <th className="px-5 py-3 text-right">Δ Rows</th>
                  <th className="px-5 py-3 text-right">Δ Size</th>
                  <th className="px-5 py-3 text-right">Snapshot</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {latestByTable.map((row) => (
                  <tr
                    key={row.tableName}
                    className="transition hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-200">
                      {row.tableName}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(row.rowEstimate)}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatBytes(Number(row.totalBytes))}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums text-zinc-400">
                      {formatBytes(Number(row.tableBytes))}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums text-zinc-400">
                      {formatBytes(Number(row.indexBytes))}
                    </td>

                    <td
                      className={`px-5 py-3 text-right tabular-nums ${deltaClass(
                        row.deltaRows,
                      )}`}
                    >
                      {row.deltaRows > 0 ? "+" : ""}
                      {formatNumber(row.deltaRows)}
                    </td>

                    <td
                      className={`px-5 py-3 text-right tabular-nums ${deltaClass(
                        row.deltaBytes,
                      )}`}
                    >
                      {row.deltaBytes > 0 ? "+" : ""}
                      {formatBytes(row.deltaBytes)}
                    </td>

                    <td className="px-5 py-3 text-right text-zinc-500">
                      {formatDate(row.snapshotDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold">{selectedTable} history</h2>
          </div>

          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Rows</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Δ Rows</th>
                  <th className="px-5 py-3 text-right">Δ Size</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {[...selectedRows].reverse().map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3">
                      {formatDate(row.snapshotDate)}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(row.rowEstimate)}
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatBytes(Number(row.totalBytes))}
                    </td>

                    <td
                      className={`px-5 py-3 text-right tabular-nums ${deltaClass(
                        row.deltaRows,
                      )}`}
                    >
                      {row.deltaRows > 0 ? "+" : ""}
                      {formatNumber(row.deltaRows)}
                    </td>

                    <td
                      className={`px-5 py-3 text-right tabular-nums ${deltaClass(
                        row.deltaBytes,
                      )}`}
                    >
                      {row.deltaBytes > 0 ? "+" : ""}
                      {formatBytes(row.deltaBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/10">
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>

      {detail && <div className="mt-1 text-sm text-zinc-500">{detail}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </div>

      <div className="mt-1 font-medium tabular-nums text-zinc-200">{value}</div>
    </div>
  );
}
