/*
 * @FilePath: \my-new-app\app\api\notes\route.ts
 * @LastEditTime: 2026-06-06 13:00:14
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { withLogging } from "@/lib/logging/withLogging";
import { log } from "@/lib/log";

export const GET = withLogging(async (req: Request) => {
  // Build context INSIDE the request handler
  const built = await buildUniversalContext(req as any, "NOTES");
  let jei = 0;
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes GET started 🎶",
    file: "app/api/notes/route.ts",
    line: 16,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    const session = await auth();
    if (!session?.user) {
      // await log.api("notes", "Unauthorized Notes GET");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;
    const notes = await db.note.findMany({
      where: { userEmail: email, isArchived: false },
      orderBy: { createdAt: "desc" },
    });

    await logj({
      domain: "notes",
      level: "info",
      message: `Notes GET completed with ${notes.length} notes`,
      file: "app/api/notes/route.ts",
      line: 43,
      payload: {
        count: notes.length,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json({ notes });
  } catch (err: any) {
    // await log.api("notes", "Notes GET failed", { error: err.message });
    return NextResponse.json(
      { error: "Failed to load notes" },
      { status: 500 },
    );
  }
});
export const POST = withLogging(async (req: Request) => {
  const built = await buildUniversalContext(req as any, "NOTES");
  let jei = 20;
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes POST started 🎶",
    file: "app/api/notes/route.ts",
    line: 66,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    const session = await auth();
    if (!session?.user) {
      // await log.api("notes", "Unauthorized Notes POST");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;
    const userId = session.user.id!;
    const body = await req.json();

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
    const built = await buildUniversalContext(req as any, "NOTES");
    await logj({
      domain: "notes",
      level: "info",
      message: "🎶 Note created 🎶",
      file: "app/api/notes/route.ts",
      line: 103,
      payload: {
        noteId: note.id,
        title: note.title,
        userEmail: email,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    // await log.api("notes", "Notes POST failed", { error: err.message });
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
});
export const PUT = withLogging(async (req: Request) => {
  let jei = 40;
  const built = await buildUniversalContext(req as any, "NOTES");
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes PUT started 🎶",
    file: "app/api/notes/route.ts",
    line: 126,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    const session = await auth();
    if (!session?.user) {
      // await log.api("notes", "Unauthorized Notes PUT");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;
    const body = await req.json();
    const { id, title, content, followUpAt, isArchived, isCompleted, color } =
      body;

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const original = await db.note.findUnique({ where: { id } });

    const updated = await db.note.updateMany({
      where: { id, userEmail: email },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(followUpAt !== undefined && {
          followUpAt: followUpAt ? new Date(followUpAt) : null,
        }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(color !== undefined && { color }),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await db.note.findUnique({ where: { id } });
    logj({
      domain: "notes",
      level: "info",
      message: `🎶 Note updated - ${updatedNote?.title} 🎶`,
      file: "app/api/notes/route.ts",
      line: 175,
      payload: {
        noteId: id,
        title: updatedNote?.title,
        isArchived,
        isCompleted,
        userEmail: email,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json({ note: updatedNote });
  } catch (err: any) {
    // await log.api("notes", "Notes PUT failed", { error: err.message });
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
});
export const DELETE = withLogging(async (req: Request) => {
  let jei = 60;
  const built = await buildUniversalContext(req as any, "NOTES");
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes DELETE started 🎶",
    file: "app/api/notes/route.ts",
    line: 192,
    payload: {
      some: "data",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    const session = await auth();
    if (!session?.user) {
      // await log.api("notes", "Unauthorized Notes DELETE");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const noteToDelete = await db.note.findUnique({ where: { id } });

    const deleted = await db.note.deleteMany({
      where: { id, userEmail: email },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    const built = await buildUniversalContext(req as any, "NOTES");
    await logj({
      domain: "jonathan",
      level: "info",
      message: "Note deleted",
      file: "route.ts",
      line: 229,
      payload: { title: noteToDelete?.title, userEmail: email },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    // await log.api("notes", "Note deleted", {
    //   noteId: id,
    //   title: noteToDelete?.title,
    //   userEmail: email,
    // });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // await log.api("notes", "Notes DELETE failed", { error: err.message });
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
});
