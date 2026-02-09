import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { getTableStats } from "@/db/table-stats";

export async function someServerLogic() {
  const ctx = await enrichContext(new NextRequest("https://www.kraus.my.id/ping"));
  const stats = await getTableStats();

  await logit(
    "jonathan",
    {
      level: "info",
      message: `Table stats: ${stats.length} tables`,
      payload: {
        sessionUser: "sessionuser",
      },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  // Use for...of so you can await
  for (const s of stats) {
    await logit(
      "jonathan",
      {
        level: "info",
        message: "Table stat row",
        payload: {
          tableStats: `${s.table_name}: rows≈${s.estimated_rows}, total_bytes=${s.total_bytes}`,
        },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );
  }

  // Or, if you prefer parallel logging:
  // await Promise.all(
  //   stats.map((s) =>
  //     logit(
  //       "jonathan",
  //       {
  //         level: "info",
  //         message: "Table stat row",
  //         payload: {
  //           tableStats: `${s.table_name}: rows≈${s.estimated_rows}, total_bytes=${s.total_bytes}`,
  //         },
  //       },
  //       { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  //     ),
  //   ),
  // );
}

export async function GET() {
  await someServerLogic();

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Ping route hit (axiom test)",
      payload: {
        uuid: "uuid",
        route: "/api/ping",
      },
    },
    {
      requestId: "requestId",
      route: "page",
      userId: "userId",
    },
  );

  return NextResponse.json({ ok: true, time: Date.now() }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() }, { status: 200 });
}
