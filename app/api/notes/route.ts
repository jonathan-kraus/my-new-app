// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { logit } from "@/lib/log/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    await logit({
      level: "warn",
      message: "Unauthorized notes access attempt",
      page: "app/api/notes/route.ts",
      line: 14,
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await db.note.findMany({
    where: { userEmail: session.user.email },
    orderBy: { updatedAt: "desc" },
  });
JSON.parse(session.user.email);
  await logit({
    level: "info",
    message: `Retrieved ${notes.length} notes`,
    page: "/notes",
    data: { userId: session.user.id },
  });

  return NextResponse.json(notes);
}
