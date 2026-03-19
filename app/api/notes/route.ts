/*
 * @FilePath: \my-new-app\app\api\notes\route.ts
 * @LastEditTime: 2026-03-19 17:34:49
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { withLogging } from "@/lib/logging/withLogging";

export const GET = withLogging(async (req: Request) => {
	await log.api("notes", "Notes GET started");

	try {
		const session = await auth();
		if (!session?.user) {
			await log.api("notes", "Unauthorized Notes GET");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const email = session.user.email!;
		const notes = await db.note.findMany({
			where: { userEmail: email, isArchived: false },
			orderBy: { createdAt: "desc" },
		});

		await log.api("notes", `Notes GET completed with ${notes.length} notes`, {
			count: notes.length,
		});

		return NextResponse.json({ notes });
	} catch (err: any) {
		await log.api("notes", "Notes GET failed", { error: err.message });
		return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
	}
});
export const POST = withLogging(async (req: Request) => {
	await log.api("notes", "Notes POST started");

	try {
		const session = await auth();
		if (!session?.user) {
			await log.api("notes", "Unauthorized Notes POST");
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

		await log.api("notes", "Note created", {
			noteId: note.id,
			title: note.title,
			userEmail: email,
		});

		await log.api("notes", "Notes POST completed", {
			noteId: note.id,
		});

		return NextResponse.json({ note });
	} catch (err: any) {
		await log.api("notes", "Notes POST failed", { error: err.message });
		return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
	}
});
export const PUT = withLogging(async (req: Request) => {
	await log.api("notes", "Notes PUT started");

	try {
		const session = await auth();
		if (!session?.user) {
			await log.api("notes", "Unauthorized Notes PUT");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const email = session.user.email!;
		const body = await req.json();
		const { id, title, content, followUpAt, isArchived, color } = body;

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
				...(color !== undefined && { color }),
			},
		});

		if (updated.count === 0) {
			return NextResponse.json({ error: "Note not found" }, { status: 404 });
		}

		const updatedNote = await db.note.findUnique({ where: { id } });

		await log.api("notes", "Note updated", {
			noteId: id,
			originalTitle: original?.title,
			newTitle: updatedNote?.title,
			isArchived,
		});

		return NextResponse.json({ note: updatedNote });
	} catch (err: any) {
		await log.api("notes", "Notes PUT failed", { error: err.message });
		return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
	}
});
export const DELETE = withLogging(async (req: Request) => {
	await log.api("notes", "Notes DELETE started");

	try {
		const session = await auth();
		if (!session?.user) {
			await log.api("notes", "Unauthorized Notes DELETE");
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

		await log.api("notes", "Note deleted", {
			noteId: id,
			title: noteToDelete?.title,
			userEmail: email,
		});

		return NextResponse.json({ success: true });
	} catch (err: any) {
		await log.api("notes", "Notes DELETE failed", { error: err.message });
		return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
	}
});
