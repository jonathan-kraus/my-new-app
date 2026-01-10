// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDbWithRls } from "@/lib/server/db-with-rls";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const email = session?.user?.email;

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
