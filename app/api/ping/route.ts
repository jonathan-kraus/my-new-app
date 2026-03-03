// app/api/db-tables/route.ts
import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { neon } from "@/lib/neon";

export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req as any);

  const client = neon();

  // Query the Data API with no API key (Anonymous Mode)
  const { data, error } = await client
    .from("verification")
    .select("table_name")
    .order("table_name");

  console.log("Data API tables:", data, error);

  await logit(
    "jonathan",
    {
      level: "info",
      message: `Table count: ${data?.length ?? 0} rows`,
      payload: { sessionUser: "sessionuser" },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  return NextResponse.json({
    ok: true,
    count: data?.length ?? 0,
    time: {
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
      utc: new Date().toISOString(),
    },
  });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() });
}
