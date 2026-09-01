import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import {
  getTableDataWithPrisma,
  getModelForTable,
} from "@/lib/db/prisma-table";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const built = await buildUniversalContext(request as any, "db-table");
  let jei = 0;

  await logj({
    domain: "jonathan",
    level: "info",
    message: `In db table detail for ${name}`,
    file: "app/api/db/table/[name]/route.ts",
    line: 18,
    payload: { name, moreinfo: "more info" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const modelName = getModelForTable(name);
  if (!modelName) {
    return NextResponse.json(
      { error: "Table excluded or not found" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const data = await getTableDataWithPrisma(name, page, limit);
    if (!data) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Table ${name} error:`, error);
    return NextResponse.json(
      { error: `Failed to fetch table ${name}` },
      { status: 500 },
    );
  }
}
