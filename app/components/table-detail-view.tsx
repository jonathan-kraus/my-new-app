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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TableIcon } from "lucide-react";

interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

interface TableDetailViewProps {
  name: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  totalPages: number;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value);
  if (str.length > 100) return str.slice(0, 100) + "...";
  return str;
}

export function TableDetailView({
  name,
  columns,
  rows,
  totalRows,
  page,
  totalPages,
}: TableDetailViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-primary" />
            Table Data
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} ({totalRows.toLocaleString()} rows)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={`/db/table/${name}?page=${page - 1}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={`/table/${name}?page=${page + 1}`}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Link>
                ) : (
                  <span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={col.name} className="first:pl-6 last:pr-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-medium">
                        {col.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="px-1 py-0 text-[10px] font-normal"
                        >
                          {col.type}
                        </Badge>
                        {col.nullable && (
                          <span className="text-[10px] text-muted-foreground">
                            nullable
                          </span>
                        )}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No data in this table.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.name}
                        className="first:pl-6 last:pr-6 max-w-[300px] truncate font-mono text-xs"
                      >
                        {row[col.name] === null ? (
                          <span className="text-muted-foreground/50 italic">
                            null
                          </span>
                        ) : (
                          formatCellValue(row[col.name])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
