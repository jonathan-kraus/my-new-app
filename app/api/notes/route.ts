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
  console.log("CTX requestId:", ctx.requestId);

  await logit({
    ...ctx,
    level: "info",
    message: "Notes GET started",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
    data: { requestId: ctx.requestId },
  });

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      await logit({
        ...ctx,
        level: "warn",
        message: "Unauthorized Notes GET",
      });

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await db.note.findMany({
      where: { userEmail: session.user.email },
      orderBy: { createdAt: "desc" },
    });
    console.log("Duration lookup:", getRequestDuration(ctx.requestId));

    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "info",
      message: "Notes GET completed",
      durationMs, // explicitly included
      eventIndex: ctx.eventIndex, // explicitly included
      data: { count: notes.length },
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "error",
      message: "Notes GET failed",
      durationMs,
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to load notes" },
      { status: 500 },
    );
  }
}

// -------------------------
// POST /api/notes
// -------------------------
export async function POST(req: NextRequest) {
  const ctx = await enrichContext(req);

  await logit({
    ...ctx,
    level: "info",
    message: "Notes POST started",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
  });

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      await logit({
        ...ctx,
        level: "warn",
        message: "Unauthorized Notes POST",
      });

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const note = await db.note.create({
      data: {
        userEmail: session.user.email,
        title: body.title ?? "",
        content: body.content ?? "",
      },
    });

    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "info",
      message: "Notes POST completed",
      durationMs,
      data: { noteId: note.id },
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      ...ctx,
      level: "error",
      message: "Notes POST failed",
      durationMs,
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
