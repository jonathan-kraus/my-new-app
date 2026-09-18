// app/api/logs/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db8 } from "@/lib/db.prisma8";
import { not, or } from "@prisma/orm-postgres/orm-client";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? 0);
  const limit = 80;
  const skip = page * limit;

  let query = db8.orm.public.Log.where((log) =>
    not(log.message.like("REQUEST END%")),
  );

  if (search) {
    const pattern = `%${search}%`;
    query = query.where((log) =>
      or(
        log.message.like(pattern),
        log.level.like(pattern),
        log.file.like(pattern),
        log.requestId.like(pattern),
      ),
    );
  }

  const logs = await query
    .orderBy((log) => log.createdAt.desc())
    .offset(skip)
    .limit(limit)
    .all();

  return NextResponse.json({
    logs: logs.map(({ createdAt, ...log }) => ({
      ...log,
      created_at: new Date(`${createdAt}Z`).toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, level, message, payload } = body ?? {};
    const built = await buildUniversalContext(req, "logs-post");
    let jei = 0;

    await logj({
      domain: domain ?? "client",
      level: level ?? "info",
      message: message ?? "Client log",
      file: "app/api/logs/route.ts",
      line: 54,
      payload: payload ?? {},
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error processing client log", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
