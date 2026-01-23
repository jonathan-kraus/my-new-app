// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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

  await logit(
    "notes",
    {
      level: "info",
      message: "Notes GET started",
      payload: { requestId: ctx.requestId },
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  try {
    const session = await auth();

    if (!session?.user) {
      await logit(
        "notes",
        {
          level: "warn",
          message: "Unauthorized Notes GET",
          payload: { requestId: ctx.requestId },
        },
        { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      );

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session?.user?.email;
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }
    const notes = await db.note.findMany({
      where: { 
        userEmail: email,
        isArchived: false 
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Duration lookup:", getRequestDuration(ctx.requestId));

    const durationMs = getRequestDuration(ctx.requestId);

    await logit(
      "notes",
      {
        level: "info",
        message: `Notes GET completed ${notes.length}`,
        payload: {
          durationMs,
          eventIndex: ctx.eventIndex,
          count: notes.length,
        },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );

    return NextResponse.json({ notes });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    await logit(
      "notes",
      {
        level: "error",
        message: "Notes GET failed",
        payload: { durationMs: durationMs, error: err.message },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );

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

  await logit(
    "notes",
    {
      level: "info",
      message: "Notes POST started",
      payload: {},
    },
    { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
  );

  try {
    const session = await auth();

    if (!session?.user) {
      await logit(
        "notes",
        {
          level: "warn",
          message: "Unauthorized Notes POST",
          payload: {},
        },
        { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
      );

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = session?.user?.id;
    const email = session?.user?.email;

    if (!userId || !email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const note = await db.note.create({
      data: {
        userId,
        userEmail: email,
        title: body.title ?? "",
        content: body.content ?? "",
        followUpAt: body.followUpAt ? new Date(body.followUpAt) : null,
      },
    });

    const durationMs = getRequestDuration(ctx.requestId);

    await logit(
      "notes",
      {
        payload: { durationMs, noteId: note.id },
        level: "info",
        message: "Notes POST completed",
      },
      {
        requestId: ctx.requestId,
        route: ctx.page,
        userId: ctx.userId,
      },
    );

    return NextResponse.json({ note });
  } catch (err: any) {
    const durationMs = getRequestDuration(ctx.requestId);

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}

// -------------------------
// PUT /api/notes/[id]
// -------------------------
export async function PUT(req: NextRequest) {
  const ctx = await enrichContext(req);

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session?.user?.email;
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, title, content, followUpAt, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const note = await db.note.updateMany({
      where: { 
        id,
        userEmail: email 
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(followUpAt !== undefined && { followUpAt: followUpAt ? new Date(followUpAt) : null }),
        ...(isArchived !== undefined && { isArchived }),
      },
    });

    if (note.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await db.note.findUnique({
      where: { id },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (err: any) {
    await logit(
      "notes",
      {
        level: "error",
        message: "Notes PUT failed",
        payload: { error: err.message },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );

    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
}

// -------------------------
// DELETE /api/notes/[id]
// -------------------------
export async function DELETE(req: NextRequest) {
  const ctx = await enrichContext(req);

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session?.user?.email;
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const note = await db.note.deleteMany({
      where: { 
        id,
        userEmail: email 
      },
    });

    if (note.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await logit(
      "notes",
      {
        level: "error",
        message: "Notes DELETE failed",
        payload: { error: err.message },
      },
      { requestId: ctx.requestId, route: ctx.page, userId: ctx.userId },
    );

    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
