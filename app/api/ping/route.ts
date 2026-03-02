import { NextResponse, NextRequest } from "next/server";
import { logit } from "@/lib/log/logit";
import { neon } from "@/lib/neon";

export async function someServerLogic(req: NextRequest) {
  const client = neon();

  const { data } = await client
    .from("WeatherSnapshot")
    .select("count()")
    .single();

  return Response.json({ count: Number(data?.count)  });
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
