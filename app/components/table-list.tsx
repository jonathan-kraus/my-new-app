"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatNumber } from "@/lib/format";
import { ArrowRight, Database } from "lucide-react";

interface TableInfo {
  name: string;
  rowEstimate: number;
  totalBytes: number;
  indexBytes: number;
  tableBytes: number;
  toastBytes: number;
  columnCount: number;
}

interface TableListProps {
  tables: TableInfo[];
}

export function TableList({ tables }: TableListProps) {
  const sorted = [...tables].sort((a, b) => b.totalBytes - a.totalBytes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          All Tables
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Table</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead className="text-right">Total Size</TableHead>
              <TableHead className="text-right">Data</TableHead>
              <TableHead className="text-right">Indexes</TableHead>
              <TableHead className="text-right">Columns</TableHead>
              <TableHead className="pr-6 text-right">
                <span className="sr-only">View</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((table) => (
              <TableRow key={table.name}>
                <TableCell className="pl-6">
                  <Link
                    href={`/admin/db/table/${table.name}`}
                    className="font-mono text-sm font-medium text-primary hover:underline"
                  >
                    {table.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatNumber(table.rowEstimate)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatBytes(table.totalBytes)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatBytes(table.tableBytes)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatBytes(table.indexBytes)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {table.columnCount}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Link
                    href={`/admin/db/table/${table.name}`}
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`View ${table.name} data`}
                  >
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
