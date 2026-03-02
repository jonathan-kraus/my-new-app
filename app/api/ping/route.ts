import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { fetchWithToken, NeonPostgrestClient } from '@neondatabase/postgrest-js';
import { getSession } from 'next-auth/react';

export async function someServerLogic(req: NextRequest) {
  const ctx = await enrichContext(req as any);
console.log("api/ping/route enriched ctx", ctx);



const client = new NeonPostgrestClient({
  dataApiUrl: process.env.NEON_DATA_API_URL!,
  options: {
    global: {
fetch: fetchWithToken(async () => process.env.NEON_DATA_API_KEY ?? null)
    },
  }
});

const { data, error } = await client
  .from('WeatherSnapshot')
  .select('count()')
console.log("api/ping/route data", data, "error", error);

  await logit(
    "jonathan",
    {
      level: "info",
      message: `Table count: ${data?.[0]?.count} rows`,
      payload: {
        sessionUser: "sessionuser",
      },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  // Use for...of so you can await
  // for (const s of stats) {
  //   await logit(
  //     "jonathan",
  //     {
  //       level: "info",
  //       message: "Table stat row",
  //       payload: {
  //         tableStats: `${s.table_name}: rows≈${s.estimated_rows}, total_bytes=${s.total_bytes}`,
  //       },
  //     },
  //     { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  //   );
  // }

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

export async function GET(req: NextRequest) {
  await someServerLogic(req);

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

  return NextResponse.json({ ok: true, time: Date.now(), count: 1 }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() }, { status: 200 });
}
