"use client";
// app\components\db\DbGrowthChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { ReactNode } from "react";

type Point = {
  date: string;
  value: number;
};

function toDateSafe(value: unknown): Date | null {
  const d =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : typeof value === "string"
          ? new Date(value)
          : null;

  return d && !Number.isNaN(d.getTime()) ? d : null;
}

export function DbGrowthChart({ data }: { data: Point[] }) {
  const safeData = data
    .map((d) => ({
      value: d.value,
      dateObj: toDateSafe(d.date),
    }))
    .filter((d) => d.dateObj && Number.isFinite(d.value))
    .sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime());

  if (safeData.length < 2) {
    return <div className="text-sm text-gray-400">Not enough data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={safeData}>
        <XAxis
          dataKey="dateObj"
          tickFormatter={(v: number | undefined) => {
            const d = toDateSafe(v);
            return d ? format(d, "MMM d") : "";
          }}
          stroke="#888"
          fontSize={12}
        />
        <YAxis
          tickFormatter={(v: number | undefined) =>
            typeof v === "number" ? `${Math.round(v / 1024 / 1024)} MB` : ""
          }
          stroke="#888"
          fontSize={12}
        />
        <Tooltip
          labelFormatter={(label: ReactNode) => {
            const d = toDateSafe(label);
            return d ? format(d, "PPP") : "";
          }}
          formatter={(v: number | undefined) =>
            typeof v === "number" ? `${(v / 1024 / 1024).toFixed(1)} MB` : ""
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
