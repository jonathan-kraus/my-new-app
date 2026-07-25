/*
 * @FilePath: \my-new-app\app\api\db-tables\route.ts
 * @LastEditTime: 2026-07-24 23:13:10
 */
import { neon } from "@neondatabase/serverless";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { NextRequest } from "next/server";

const db = neon(process.env.DATABASE_URL!);
type FormattedTable = {
  name: string;
  exact_count: number;
  sizes: {
    total_bytes: number;
    index_bytes: number;
    toast_bytes: number;
  };
};

export async function GET(req: NextRequest) {
  const built = await buildUniversalContext(req, "dbtables");
  let jei = 0;
  console.log("db-tables route called");
  await logj({
    domain: "jonathan",
    level: "info",
    message: `API db-tables started`,
    file: "app/api/db-tables/route.ts",
    line: 24,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const tables = (await db`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name ASC
  `) as { table_name: string }[];

  const results = [];

  for (const { table_name } of tables) {
    // Safe identifier quoting
    const quoted = `"${table_name.replace(/"/g, '""')}"`;
    await logj({
      domain: "jonathan",
      level: "info",
      message: `API db-tables count rows for table: ${table_name}`,
      file: "app/api/db-tables/route.ts",
      line: 47,
      payload: {
        table_name: table_name,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    // Count rows
    const countRows = (await db`
      SELECT COUNT(*)::int AS exact_count
      FROM ${quoted}
    `) as { exact_count: number }[];

    const { exact_count } = countRows[0]!;

    // Size metrics
    await logj({
      domain: "jonathan",
      level: "info",
      message: `API db-tables size metrics for table: ${table_name}`,
      file: "app/api/db-tables/route.ts",
      line: 67,
      payload: {
        table_name: table_name,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    const sizeRows = (await db`
      SELECT
        pg_total_relation_size(${quoted}) AS total_bytes,
        pg_indexes_size(${quoted}) AS index_bytes,
        pg_total_relation_size(${quoted}::regclass)
          - pg_relation_size(${quoted})
          - pg_indexes_size(${quoted}) AS toast_bytes
    `) as {
      total_bytes: number;
      index_bytes: number;
      toast_bytes: number;
    }[];

    const { total_bytes, index_bytes, toast_bytes } = sizeRows[0]!;
    const results: FormattedTable[] = [];
    results.push({
      name: table_name,
      exact_count,
      sizes: {
        total_bytes,
        index_bytes,
        toast_bytes,
      },
    });
  }

  return Response.json(results);
}
