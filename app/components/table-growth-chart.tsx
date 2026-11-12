"use client";

import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBytes, formatNumber } from "@/lib/format";

interface HistoryEntry {
  tableName: string;
  rowEstimate: number;
  totalBytes: number;
  snapshotDate: string;
}

interface TableGrowthChartProps {
  history: HistoryEntry[];
  tables: string[];
}

export function TableGrowthChart({ history, tables }: TableGrowthChartProps) {
  // Get latest snapshot per table
  const latestPerTable = new Map<string, HistoryEntry>();
  for (const entry of history) {
    const existing = latestPerTable.get(entry.tableName);
    if (
      !existing ||
      new Date(entry.snapshotDate) > new Date(existing.snapshotDate)
    ) {
      latestPerTable.set(entry.tableName, entry);
    }
  }

  const chartData = tables
    .filter((t) => latestPerTable.has(t))
    .map((tableName) => {
      const entry = latestPerTable.get(tableName)!;
      return {
        name: tableName,
        rows: entry.rowEstimate,
        size: entry.totalBytes,
      };
    })
    .sort((a, b) => b.rows - a.rows)
    .slice(0, 10);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Row Distribution
          </CardTitle>
          <CardDescription>Rows per table from latest snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No history data yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    rows: {
      label: "Rows",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Row Distribution
        </CardTitle>
        <CardDescription>Rows per table from latest snapshot</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={formatNumber} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 12 }}
              className="font-mono"
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "rows") return formatNumber(Number(value));
                    return formatBytes(Number(value));
                  }}
                />
              }
            />
            <Bar
              dataKey="rows"
              fill="var(--color-chart-2)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
