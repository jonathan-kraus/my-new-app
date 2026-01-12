// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

// ----------------------
// GET — fetch notes
// ----------------------
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const email = session?.user?.email;

  await logit({
    level: "info",
    message: `In Notes API`,
    file: "app/api/notes/route.ts",
    page: "Notes app",
    data: {
      email,
      sessionUser: session?.user,
      headers: req.headers || "Header???",
      line: 12,
    },
  });

  if (!email) {
    return NextResponse.json({ notes: [], isVp: false }, { status: 401 });
  }

  const dbRls = await getDbWithRls(email);

  const searchParams = req.nextUrl.searchParams;
  const view = searchParams.get("view") ?? "my-active";

  const userRole = await db.userRole.findUnique({
    where: { email },
  });
  const isVp = userRole?.role === "VP";

  let notes;

  if (view === "all-users" && isVp) {
    notes = await dbRls.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  } else if (view === "my-all") {
    notes = await dbRls.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  } else {
    notes = await dbRls.note.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ notes, isVp });
}

// ----------------------
// POST — create a note
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbRls = await getDbWithRls(email);
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Content required" },
        { status: 400 }
      );
    }

    const note = await dbRls.note.create({
      data: {
        content,
        userEmail: email,
      },
    });

    return NextResponse.json({ ok: true, note });
  } catch (err) {
    await logit({
      level: "error",
      message: "Failed to create note",
      file: "app/api/notes/route.ts",
      data: { error: String(err) },
    });

    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
