import { sql, excludeTables } from "@/lib/db/utils";
import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  await logit(
    "jonathan",
    { level: "info", message: "In db table detail for ${ name }", name },
    { moreinfo: "more info here", eventIndex: 22 },
    {
      requestId: crypto.randomUUID(),
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  if (excludeTables.includes(name)) {
    return NextResponse.json({ error: "Table excluded" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  try {
    // Validate table exists
    const tableCheck = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${name}
    `;
    if (tableCheck.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Get columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${name}
      ORDER BY ordinal_position
    `;

    // Get row count
    const countResult = await sql.query(
      `SELECT COUNT(*)::int AS count FROM "${name}"`,
    );
    const totalRows = countResult[0].count;

    // Get rows with pagination - order by first column
    const firstCol = columns[0]?.column_name || "id";
    const rows = await sql.query(
      `SELECT * FROM "${name}" ORDER BY "${firstCol}" DESC LIMIT ${limit} OFFSET ${offset}`,
    );

    return NextResponse.json({
      name,
      columns: columns.map((c) => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable === "YES",
      })),
      rows,
      totalRows,
      page,
      limit,
      totalPages: Math.ceil(totalRows / limit),
    });
  } catch (error) {
    console.error(`Table ${name} error:`, error);
    return NextResponse.json(
      { error: `Failed to fetch table ${name}` },
      { status: 500 },
    );
  }
}
