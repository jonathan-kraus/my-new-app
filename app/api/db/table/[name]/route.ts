import { NextResponse } from "next/server";
import { logit } from "@/lib/log/logit";
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

  await logit(
    "jonathan",
    { level: "info", message: "In db table detail for ${ name }", name },
    { moreinfo: "more info ", eventIndex: 22 },
    {
      requestId: crypto.randomUUID(),
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

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
