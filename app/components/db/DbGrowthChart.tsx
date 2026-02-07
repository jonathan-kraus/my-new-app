/*
 * @FilePath     : \my-new-app\app\components\db\DbGrowthChart.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-07 01:54:34
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-07 02:00:12
 */
// components/db/DbGrowthChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export function DbGrowthChart({ data }: { data: any[] }) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.capturedAt), "MMM d"),
    totalBytes: Number(d.totalBytes),
    deltaBytes: d.deltaBytes,
  }));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Table Growth Over Time</h2>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `${(v / 1024 / 1024).toFixed(1)} MB`} />
          <Tooltip
            formatter={(value: number | undefined) => {
              if (typeof value !== "number") return "0 MB";
              return `${(value / 1024 / 1024).toFixed(2)} MB`;
            }}
          />

          <Line
            type="monotone"
            dataKey="totalBytes"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
