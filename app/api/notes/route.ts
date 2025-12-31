// app/api/notes/route.ts -  UNCOMMENT + SECURE
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth";
const auth = getAuth();
export async function GET() {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await db.note.findMany({
      where: { userEmail: session.user.email },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
