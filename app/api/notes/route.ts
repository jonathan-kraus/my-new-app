// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbWithRls } from "@/lib/server/db-with-rls";
import { logit } from "@/lib/log/server";

export async function GET(req: NextRequest) {
  await logit({
    level: "info",
    message: "#1 Notes GET started",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
  });

  const session = await auth.api.getSession({ headers: req.headers });

  await logit({
    level: "info",
    message: "#1 Session resolved",
    page: "/api/notes",
    file: "app/api/notes/route.ts",
    data: { email: session?.user?.email },
  });

  if (!session?.user?.email) {
    return NextResponse.json({ notes: [] });
  }

  const db = getDbWithRls(session.user.email);

  try {
    const rows = await db`
      SELECT id, title, content, created_at
      FROM notes
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ notes: rows });
  } catch (err: any) {
    await logit({
      level: "error",
      message: "#1 Notes GET failed",
      page: "/api/notes",
      file: "app/api/notes/route.ts",
      data: { error: err.message },
    });

    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
