"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDate, formatNumber, formatBytes } from "@/lib/format";
import { TrendingUp } from "lucide-react";

interface HistoryEntry {
  tableName: string;
  rowEstimate: number;
  totalBytes: number;
  snapshotDate: string;
}

interface TableHistoryChartProps {
  history: HistoryEntry[];
  tableName: string;
}

export function TableHistoryChart({
  history,
  tableName,
}: TableHistoryChartProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Growth History
          </CardTitle>
          <CardDescription>
            No history data for {tableName}. Take a snapshot from the overview
            page to start tracking.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = history.map((h) => ({
    date: new Date(h.snapshotDate).toISOString().split("T")[0],
    rows: h.rowEstimate,
    size: h.totalBytes,
  }));

  const chartConfig = {
    rows: {
      label: "Rows",
      color: "var(--color-chart-1)",
    },
    size: {
      label: "Size",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Row Count History
          </CardTitle>
          <CardDescription>Row count over time for {tableName}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="fill-table-rows"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
                width={50}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNumber(Number(value))}
                    labelFormatter={(label) => formatDate(label)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="rows"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#fill-table-rows)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Storage History
          </CardTitle>
          <CardDescription>
            Storage usage over time for {tableName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="fill-table-size"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatBytes}
                width={60}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatBytes(Number(value))}
                    labelFormatter={(label) => formatDate(label)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="size"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fill="url(#fill-table-size)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
