// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/logit";
import { withLogging } from "@/lib/logging/withLogging";

// -------------------------
// GET /api/notes
// -------------------------

export const GET = withLogging(async (req: Request) => {
  await logit("notes", {
    level: "info",
    message: "Notes GET started",
    payload: { requestId: "REQ" },
  });

  try {
    const session = await auth();

    if (!session?.user) {
      await logit("notes", {
        level: "warn",
        message: "Unauthorized Notes GET",
        payload: { requestId: "REQ" },
      });

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session?.user?.email;
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }
    const notes = await db.note.findMany({
      where: {
        userEmail: email,
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
    });

    await logit("notes", {
      level: "info",
      message: `Notes GET completed ${notes.length}`,
      payload: {
        count: notes.length,
      },
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    await logit("notes", {
      level: "error",
      message: "Notes GET failed",
      payload: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to load notes" },
      { status: 500 },
    );
  }
});

// -------------------------
// POST /api/notes
// -------------------------
export const POST = withLogging(async (req: Request) => {
  await logit("notes", {
    level: "info",
    message: "Notes POST started",
    payload: {},
  });

  try {
    const session = await auth();

    if (!session?.user) {
      await logit("notes", {
        level: "warn",
        message: "Unauthorized Notes POST",
        payload: {},
      });

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
        color: body.color ?? null,
      },
    });

    await logit("notes", {
      level: "info",
      message: `Note created: ${note.title || "Untitled"} by ${email}`,
      payload: {
        noteId: note.id,
        title: note.title,
        action: "created",
        userEmail: email,
      },
    });

    await logit("notes", {
      payload: { noteId: note.id },
      level: "info",
      message: "Notes POST completed",
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
});
// -------------------------
// PUT /api/notes/[id]
// -------------------------
export const PUT = withLogging(async (req: Request) => {
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
    const { id, title, content, followUpAt, isArchived, color } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Get the original note for logging changes
    const originalNote = await db.note.findUnique({
      where: { id },
    });

    const note = await db.note.updateMany({
      where: {
        id,
        userEmail: email,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(followUpAt !== undefined && {
          followUpAt: followUpAt ? new Date(followUpAt) : null,
        }),
        ...(isArchived !== undefined && { isArchived }),
        ...(color !== undefined && { color }),
      },
    });

    if (note.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await db.note.findUnique({
      where: { id },
    });

    // Log the specific action taken
    let actionMessage = "";
    if (isArchived) {
      actionMessage = `Note archived: ${originalNote?.title || "Untitled"} by ${email}`;
    } else {
      const changes = [];
      if (title !== undefined && title !== originalNote?.title) {
        changes.push(`title: "${originalNote?.title}" → "${title}"`);
      }
      if (content !== undefined && content !== originalNote?.content) {
        changes.push(`content updated`);
      }
      if (followUpAt !== undefined) {
        const oldFollowUp = originalNote?.followUpAt
          ? new Date(originalNote.followUpAt).toLocaleString()
          : "none";
        const newFollowUp = followUpAt
          ? new Date(followUpAt).toLocaleString()
          : "none";
        changes.push(`followUp: ${oldFollowUp} → ${newFollowUp}`);
      }
      if (color !== undefined && color !== originalNote?.color) {
        changes.push(
          `color: ${originalNote?.color || "none"} → ${color || "none"}`,
        );
      }

      actionMessage = `Note edited: ${originalNote?.title || "Untitled"} by ${email} - ${changes.join(", ")}`;
    }

    await logit("notes", {
      level: "info",
      message: actionMessage,
      payload: {
        noteId: id,
        title: originalNote?.title,
        action: isArchived ? "archived" : "edited",
        userEmail: email,
        changes: {
          title: title !== originalNote?.title,
          content: content !== originalNote?.content,
          followUpAt: followUpAt !== originalNote?.followUpAt,
          color: color !== originalNote?.color,
          isArchived,
        },
      },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (err: any) {
    await logit("notes", {
      level: "error",
      message: "Notes PUT failed",
      payload: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
});
// -------------------------
// DELETE /api/notes/[id]
// -------------------------
export const DELETE = withLogging(async (req: Request) => {
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
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Get the note before deletion for logging
    const noteToDelete = await db.note.findUnique({
      where: { id },
    });

    const note = await db.note.deleteMany({
      where: {
        id,
        userEmail: email,
      },
    });

    if (note.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await logit("notes", {
      level: "info",
      message: `Note deleted: ${noteToDelete?.title || "Untitled"} by ${email}`,
      payload: {
        noteId: id,
        title: noteToDelete?.title,
        action: "deleted",
        userEmail: email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await logit("notes", {
      level: "error",
      message: "Notes DELETE failed",
      payload: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
});
