/*
 * @FilePath: \my-new-app\app\api\notes\due\route.ts
 * @LastEditTime: 2026-05-22 01:01:33
 */
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

// GET /api/notes/due?days=7
//
// Returns notes with followUpAt within the next `days` days
// that are not completed or archived, for the authenticated user.
//
// ── Swap this import for your actual session helper ───────────────────────────
import { auth } from "@/auth"; // NextAuth v5 / Auth.js
// import { getServerSession } from 'next-auth'
// import { currentUser } from '@clerk/nextjs/server'
// ─────────────────────────────────────────────────────────────────────────────

interface NoteRow {
  id: string;
  title: string | null;
  content: string;
  followUpAt: Date;
  tags: string[];
  color: string | null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const days = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("days") || "7"), 1),
    90,
  );

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 },
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { rows } = await pool.query<NoteRow>(
      `SELECT id, title, content, "followUpAt", tags, color
       FROM "Note"
       WHERE "userId"      = $1
         AND "followUpAt"  >= NOW()
         AND "followUpAt"  <= NOW() + ($2 || ' days')::interval
         AND "isCompleted" = false
         AND "isArchived"  = false
       ORDER BY "followUpAt" ASC`,
      [userId, days],
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const overdue = rows.filter((r) => new Date(r.followUpAt) < today);
    const dueToday = rows.filter((r) => {
      const d = new Date(r.followUpAt);
      return d >= today && d < tomorrow;
    });
    const upcoming = rows.filter((r) => new Date(r.followUpAt) >= tomorrow);

    return NextResponse.json({
      total: rows.length,
      days,
      overdue,
      dueToday,
      upcoming,
    });
  } catch (err: unknown) {
    console.error("[notes-due] query error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
