/*
 * @FilePath     : \my-new-app\app\api\db-stats\history\route.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-07 01:52:50
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-07 01:52:57
 */
// app/api/db-stats/history/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table"); // optional

  const where = table ? { tableName: table } : {};

  const rows = await db.dbTableStats.findMany({
    where,
    orderBy: { capturedAt: "asc" },
  });

  // Compute deltas (today vs yesterday)
  const withDeltas = rows.map((row, i) => {
    const prev = rows[i - 1];

    if (!prev) {
      return {
        ...row,
        deltaRows: 0,
        deltaBytes: 0,
      };
    }

    return {
      ...row,
      deltaRows: row.rowEstimate - prev.rowEstimate,
      deltaBytes: Number(row.totalBytes) - Number(prev.totalBytes),
    };
  });

  return NextResponse.json(withDeltas);
}
