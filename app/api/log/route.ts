import { NextRequest, NextResponse } from "next/server";
import { getAuth, auth } from '@/lib/auth';
import { db } from "@/lib/db";
const auth = getAuth();
export async function POST(req: NextRequest) {
  try {
    const authSession = await auth.api.getSession();

    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await db.log.create({
      data: {
        level: body.level,
        message: body.message,
        userId: authSession.user.id,
        page: body.page,
        data: body.data,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Log error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
