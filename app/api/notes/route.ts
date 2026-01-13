// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

// GET
export async function GET(req: NextRequest) {
  const h = await headers(); // ← FIX
  const session = await auth.api.getSession({ headers: h }); // ← FIX
  const email = session?.user?.email;

  await logit({
    level: "info",
    message: "Notes API GET",
    file: "app/api/notes/route.ts",
    page: "Notes",
    data: { email, headers: req.headers },
  });

  if (!email) {
    return NextResponse.json({ notes: [], isVp: false }, { status: 401 });
  }

  const dbRls = await getDbWithRls(email);

  const searchParams = req.nextUrl.searchParams;
  const view = searchParams.get("view") ?? "my-active";

  // Check if user is VP
  const roleResult = await dbRls.query(
    `SELECT role FROM "UserRole" WHERE email = $1 LIMIT 1`,
    [email],
  );
  const isVp = roleResult[0]?.role === "VP";

  let notes;

  if (view === "all-users" && isVp) {
    // VP sees everything
    notes = await dbRls.query(`SELECT * FROM "Note" ORDER BY "createdAt" DESC`);
  } else if (view === "my-all") {
    notes = await dbRls.query(`SELECT * FROM "Note" ORDER BY "createdAt" DESC`);
  } else {
    notes = await dbRls.query(
      `SELECT * FROM "Note" WHERE archived = false ORDER BY "createdAt" DESC`,
    );
  }

    await logit({
      level: "info",
      message: "Fetched notes /api/notes",
      file: "app/api/notes/route.ts",
      line: 52,
      data: {
        count: notes.length,
        user: email,
      },
    });
  return NextResponse.json({
    notes: Array.isArray(notes) ? notes : [],
    isVp,
  });
}

// ------------------------------------------------------------
// POST — Create a new note
// ------------------------------------------------------------
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const h = headers(); // ← REAL HEADERS
    const session = await auth.api.getSession({ headers: h });
    const email = session?.user?.email;

    await logit({
      level: "info",
      message: "Notes API POST hit",
      file: "app/api/notes/route.ts",
      data: { email },
    });

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

    const title = content.trim().slice(0, 40) || "Untitled Note";

    const result = await dbRls.query(
      `
      INSERT INTO "Note" ("title", "content", "userEmail")
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, content, email]
    );

    const note = result[0];

    await logit({
      level: "info",
      message: "Note created",
      file: "app/api/notes/route.ts",
      data: { email, noteId: note.id },
    });

    return NextResponse.json({ ok: true, note });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Failed to create note",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
