import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await db.log.create({
      data: {
        level: body.level,
        message: body.message,
        userId: body.userId ?? null,
        page: body.page ?? null,
        data: body.data ?? null,
        createdAt: new Date(body.createdAt),
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
