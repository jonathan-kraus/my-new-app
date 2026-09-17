/*
 * @FilePath: \my-new-app\app\api\db-stats\history\route.ts
 */

import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";

export const runtime = "nodejs";

function sanitizeBigInt(obj: unknown) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v)),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");

  const rows = table
    ? await db8.orm.public.DbTableStats.where((stat) =>
        stat.tableName.eq(table),
      )
        .orderBy((stat) => stat.snapshotDate.asc())
        .all()
    : await db8.orm.public.DbTableStats.orderBy((stat) =>
        stat.snapshotDate.asc(),
      ).all();

  // Track previous snapshot independently for each table.
  const previousByTable = new Map<string, (typeof rows)[number]>();

  const withDeltas = rows.map((row) => {
    const prev = previousByTable.get(row.tableName);

    previousByTable.set(row.tableName, row);

    if (!prev) {
      return {
        ...row,
        deltaRows: 0,
        deltaBytes: 0,
      };
    }

    return {
      ...row,
      deltaRows: Number(row.rowEstimate) - Number(prev.rowEstimate),
      deltaBytes: Number(row.totalBytes) - Number(prev.totalBytes),
    };
  });

  return NextResponse.json(sanitizeBigInt(withDeltas));
}
