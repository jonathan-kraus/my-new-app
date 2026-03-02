import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { neon } from "@/lib/neon";

export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req as any);

  const client = neon();


const { data } = await client
  .from("DbTableStats")
  .select("*")
  .limit(50);

console.log("Data API tables:", data);

  await logit(
    "jonathan",
    {
      level: "info",
      message: `Table count: ${data?.count} rows`,
      payload: { sessionUser: "sessionuser" },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  return NextResponse.json({
    ok: true,
    count: Number(data?.count ?? 0),
    time: {
  local: new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  }),
  utc: new Date().toISOString(),
}

  });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() });
}
