/*
 * @FilePath: \my-new-app\app\api\db-tables\route.ts
 * @LastEditTime: 2026-07-24 23:45:42
 */
import { neon } from "@neondatabase/serverless";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { NextRequest } from "next/server";

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
  console.log("db-tables module loaded");

  const db = neon(process.env.DATABASE_URL!);

  const built = await buildUniversalContext(req, "dbtables");
  let jei = 0;

  console.log("db-tables route called");

  await logj({
    domain: "jonathan",
    level: "info",
    message: `API db-tables started`,
    file: "app/api/db-tables/route.ts",
    line: 30,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const tables = (await db`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name ASC
  `) as { table_name: string }[];

  const results: FormattedTable[] = [];

  for (const { table_name } of tables) {
    const quoted = `"${table_name.replace(/"/g, '""')}"`;

    await logj({
      domain: "jonathan",
      level: "info",
      message: `API db-tables count rows for table: ${table_name}`,
      file: "app/api/db-tables/route.ts",
      line: 52,
      payload: { table_name },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const countRows = await db`
      SELECT COUNT(*)::int AS exact_count
      FROM ${db.unsafe(`${quoted}::regclass`)}
    `;
    const { exact_count } = countRows[0]!;

    await logj({
      domain: "jonathan",
      level: "info",
      message: `API db-tables size metrics for table: ${table_name}`,
      file: "app/api/db-tables/route.ts",
      line: 68,
      payload: { table_name },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    const sizeRows = await db`
      SELECT
        pg_total_relation_size(${db.unsafe(`${quoted}::regclass`)}) AS total_bytes,
        pg_indexes_size(${db.unsafe(`${quoted}::regclass`)}) AS index_bytes,
        pg_total_relation_size(${db.unsafe(`${quoted}::regclass`)})
          - pg_relation_size(${db.unsafe(`${quoted}::regclass`)})
          - pg_indexes_size(${db.unsafe(`${quoted}::regclass`)}) AS toast_bytes
    `;
    const { total_bytes, index_bytes, toast_bytes } = sizeRows[0]!;

    results.push({
      name: table_name,
      exact_count,
      sizes: { total_bytes, index_bytes, toast_bytes },
    });
  }

  return Response.json(results);
}
