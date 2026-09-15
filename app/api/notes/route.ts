/*
 * @FilePath: \my-new-app\app\api\notes\route.ts
 * @LastEditTime: 2026-09-15 16:03:49
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db8 } from "@/lib/db.prisma8";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { withLogging } from "@/lib/logging/withLogging";

const timestampString = (value: string) =>
  value as `${string}` & { readonly __timestampStringPrecision: 3 };

export const GET = withLogging(async (req: Request) => {
  // Build context INSIDE the request handler
  const built = await buildUniversalContext(req, "NOTES");
  let jei = 0;
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes GET started 🎶",
    file: "app/api/notes/route.ts",
    line: 21,
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
    const notes = await db8.orm.public.Note.where({
      userEmail: email,
      isArchived: false,
    })
      .orderBy((note) => note.createdAt.desc())
      .all();

    console.log("DB8 NOTES:", notes);

    await logj({
      domain: "notes",
      level: "info",
      message: `Notes GET completed with ${notes.length} notes`,
      file: "app/api/notes/route.ts",
      line: 51,
      payload: {
        count: notes.length,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json({ notes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    await logj({
      domain: "notes",
      level: "error",
      message: `Notes GET failed with error: ${msg}`,
      file: "app/api/notes/route.ts",
      line: 65,
      payload: {
        error: msg,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json(
      { error: "Failed to load notes" },
      { status: 500 },
    );
  }
});
export const POST = withLogging(async (req: Request) => {
  const built = await buildUniversalContext(req, "NOTES");
  let jei = 20;
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes POST started 🎶",
    file: "app/api/notes/route.ts",
    line: 85,
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

    const note = await db8.orm.public.Note.create({
      userId,
      userEmail: email,
      title: body.title ?? "",
      content: body.content ?? "",
      followUpAt: body.followUpAt
        ? timestampString(new Date(body.followUpAt).toISOString())
        : null,
      color: body.color ?? null,
      updatedAt: timestampString(new Date().toISOString()),
    });
    const built = await buildUniversalContext(req, "NOTES");
    await logj({
      domain: "notes",
      level: "info",
      message: "🎶 Note created 🎶",
      file: "app/api/notes/route.ts",
      line: 120,
      payload: {
        noteId: note.id,
        title: note.title,
        userEmail: email,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({ note });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    await logj({
      domain: "notes",
      level: "error",
      message: `Notes GET failed with error: ${msg}`,
      file: "app/api/notes/route.ts",
      line: 137,
      payload: {
        error: msg,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
});
export const PUT = withLogging(async (req: Request) => {
  let jei = 40;
  const built = await buildUniversalContext(req, "NOTES");
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes PUT started 🎶",
    file: "app/api/notes/route.ts",
    line: 157,
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

    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(followUpAt !== undefined && {
        followUpAt: followUpAt
          ? timestampString(new Date(followUpAt).toISOString())
          : null,
      }),
      ...(isArchived !== undefined && { isArchived }),
      ...(isCompleted !== undefined && { isCompleted }),
      ...(color !== undefined && { color }),
    };

    const updated = await db8.orm.public.Note.where({
      id,
      userEmail: email,
    }).update(updateData);

    if (!updated) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = updated;
    await logj({
      domain: "notes",
      level: "info",
      message: `🎶 Note updated - ${updatedNote?.title} 🎶`,
      file: "app/api/notes/route.ts",
      line: 213,
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    await logj({
      domain: "notes",
      level: "error",
      message: `Notes PUT failed with error: ${msg}`,
      file: "app/api/notes/route.ts",
      line: 231,
      payload: {
        error: msg,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
});
export const DELETE = withLogging(async (req: Request) => {
  let jei = 60;
  const built = await buildUniversalContext(req, "NOTES");
  await logj({
    domain: "notes",
    level: "info",
    message: "🎶 Notes DELETE started 🎶",
    file: "app/api/notes/route.ts",
    line: 251,
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

    const noteToDelete = await db8.orm.public.Note.where({ id }).first();

    const deleted = await db8.orm.public.Note.where({
      id,
      userEmail: email,
    }).delete();

    if (!deleted) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    const built = await buildUniversalContext(req, "NOTES");
    await logj({
      domain: "notes",
      level: "info",
      message: "Note deleted",
      file: "app/api/notes/route.ts",
      line: 293,
      payload: { title: noteToDelete?.title, userEmail: email },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    await logj({
      domain: "notes",
      level: "error",
      message: `Notes DELETE failed with error: ${msg}`,
      file: "app/api/notes/route.ts",
      line: 306,
      payload: {
        error: msg,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
});
