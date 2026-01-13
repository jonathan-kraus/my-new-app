// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

export const dynamic = "force-dynamic";

// GET /api/notes
export async function GET(req: NextRequest) {
  const h = await headers();
await logit({
  level: "info",
  message: "In Notes dp we have requestId",
  requestId: req.headers.get("x-request-id"),
  file: "app/api/test/route.ts",
  line: 14,
  data: {
    dynamic: dynamic,
  }
});

  try {
    const session = await auth.api.getSession({ headers: h });
    const email = session?.user?.email;

    await logit({
      level: "info",
      message: "Notes API GET hit",
      file: "app/api/notes/route.ts",
      data: { email },
    });

    if (!email) {
      await logit({
        level: "warn",
        message: "Notes GET blocked: no session",
        file: "app/api/notes/route.ts",
      });
      return NextResponse.json({ notes: [] }, { status: 401 });
    }

    const db = getDbWithRls(email);

    const notes = await db`
      SELECT id, title, content, created_at
      FROM notes
      ORDER BY created_at DESC
    `;

    await logit({
      level: "info",
      message: "Notes GET success",
      file: "app/api/notes/route.ts",
      data: { count: notes.length },
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Notes GET failed",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/notes
export async function POST(req: NextRequest) {
  const h = await headers();

  try {
    const session = await auth.api.getSession({ headers: h });
    const email = session?.user?.email;

    await logit({
      level: "info",
      message: "Notes API POST hit",
      file: "app/api/notes/route.ts",
      data: { email },
    });

    if (!email) {
      await logit({
        level: "warn",
        message: "Notes POST blocked: no session",
        file: "app/api/notes/route.ts",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    const db = getDbWithRls(email);

    const inserted = await db`
      INSERT INTO notes (title, content)
      VALUES (${title}, ${content})
      RETURNING id, title, content, created_at
    `;

    await logit({
      level: "info",
      message: "Note created",
      file: "app/api/notes/route.ts",
      data: { id: inserted[0]?.id },
    });

    return NextResponse.json({ note: inserted[0] });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "Failed to create note",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
