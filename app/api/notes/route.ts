// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrichContext } from "@/lib/log/context";
import { logit } from "@/lib/log/server";
import { getRequestDuration } from "@/lib/log/timing";

// -------------------------
// GET /api/notes
// -------------------------
export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);
  const durationStartId = ctx.requestId;

  await logit({
    ...ctx,
    level: "info",
    message: "init -- Notes GET started -- init",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
    data: {requestId: req.headers.get("x-request-id")}
  });
console.log("API NOTES ROUTE requestId:", req.headers.get("x-request-id"));

  const session = await auth.api.getSession({ headers: req.headers });

  await logit({
    ...ctx,
    level: "info",
    message: "Session resolved",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
    data: {
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      name: session?.user?.name ?? null,
      sessionId: session?.session?.id ?? null,
    },
  });

  if (!session?.user?.id) {
    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "info",
      message: "Notes GET completed (unauthorized)",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
    });

    return NextResponse.json({ notes: [] });
  }

  try {
    const rows = await db.note.findMany({
      orderBy: { createdAt: "desc" },
    });

    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "info",
      message: "Notes GET completed",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
      data: { count: rows.length },
    });

    return NextResponse.json({ notes: rows });
  } catch (err: any) {
    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "error",
      message: "Notes GET failed",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 },
    );
  }
}

// -------------------------
// POST /api/notes
// -------------------------
export async function POST(req: NextRequest) {
  const ctx = await enrichContext(req);
  const durationStartId = ctx.requestId;

  await logit({
    ...ctx,
    level: "info",
    message: "Notes POST started",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
  });

  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.email) {
    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "warn",
      message: "Notes POST unauthorized",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  const body = await req.json();
  const { title, content } = body;

  try {
    const titleToUse =
      typeof title === "string" && title.trim().length > 0
        ? title
        : (typeof content === "string" && content.trim().slice(0, 40)) ||
          "Untitled Note";

    const note = await db.note.create({
      data: {
        title: titleToUse,
        content,
        userEmail: email,
      },
    });
    const durationMs = getRequestDuration(durationStartId);
    await logit({
      ...ctx,
      level: "info",
      message: "Note created",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
      data: { noteId: note.id },
    });
    return NextResponse.json({ note });
  } catch (err: any) {
    const durationMs = getRequestDuration(durationStartId);

    await logit({
      ...ctx,
      level: "error",
      message: "Notes POST failed",
      durationMs,
      page: "/api/notes",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
