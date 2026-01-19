// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";
import { enrichContext } from "@/lib/log/context";
import { getRequestDuration } from "@/lib/log/timing";

// -------------------------
// GET /api/notes
// -------------------------
export async function GET(req: NextRequest) {
  const ctx = await enrichContext(req);
  console.log("CTX requestId:", ctx.requestId);

  await logit({
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    level: "info",
    message: "Notes GET started",
    notes: { requestId: ctx.requestId },
  });

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      await logit({
        meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
        level: "warn",
        message: "Unauthorized Notes GET",
        notes: { requestId: ctx.requestId },
      });

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await db.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    console.log("Duration lookup:", getRequestDuration(ctx.requestId));

    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      level: "info",
      message: "Notes GET completed",
      notes: { durationMs, eventIndex: ctx.eventIndex, count: notes.length },
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      level: "error",
      message: "Notes GET failed",
      notes: { durationMs: durationMs, error: err.message },
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
    meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    level: "info",
    message: "Notes POST started",
    notes: {},
  });

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      await logit({
        meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
        level: "warn",
        message: "Unauthorized Notes POST",
        notes: {},
      });

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const note = await db.note.create({
      data: {
        userId: session.user.id,
        title: body.title ?? "",
        content: body.content ?? "",
      },
    });

    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      meta: {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
      notes: { durationMs, noteId: note.id },
      level: "info",
      message: "Notes POST completed",
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit({
      meta: { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      level: "error",
      message: "Notes POST failed",
      notes: { durationMs, error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
