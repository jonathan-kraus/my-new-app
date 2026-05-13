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
import { formatDate, formatNumber } from "@/lib/format";
import { TrendingUp } from "lucide-react";

interface HistoryEntry {
  tableName: string;
  rowEstimate: number;
  totalBytes: number;
  snapshotDate: string;
}

interface GrowthChartProps {
  history: HistoryEntry[];
  title: string;
  description?: string;
  dataKey: "rowEstimate" | "totalBytes";
  formatValue?: (v: number) => string;
}

export function GrowthChart({
  history,
  title,
  description,
  dataKey,
  formatValue = formatNumber,
}: GrowthChartProps) {
  // Aggregate across all tables per date
  const dateMap = new Map<string, number>();
  for (const entry of history) {
    const raw = entry.snapshotDate;
    if (!raw) {
      continue; // or throw
    }

    const [date] = new Date(raw).toISOString().split("T") as [
      string,
      ...string[],
    ];

    const current = dateMap.get(date) ?? 0;

    const value = entry[dataKey];
    if (typeof value !== "number") {
      continue; // or throw
    }

    dateMap.set(date, current + value);
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No history data yet. Take a snapshot to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    value: {
      label: title,
      color: "var(--color-chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id={`fill-${dataKey}`}
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
              tickFormatter={formatValue}
              width={60}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatValue(Number(value))}
                  labelFormatter={(label) => formatDate(label)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill={`url(#fill-${dataKey})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
