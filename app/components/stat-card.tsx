import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, formatNumber } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  format?: "number" | "bytes";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  format = "number",
}: StatCardProps) {
  const displayValue =
    format === "bytes" ? formatBytes(value) : formatNumber(value);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">{title}</p>

          <p className="text-2xl font-semibold tracking-tight text-card-foreground">
            {displayValue}
          </p>

          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
