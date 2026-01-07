import { NextResponse } from "next/server";
import { log } from "next-axiom";
import { transformWorkflowRunEvent } from "@/lib/github/transform";

export async function GET() {
  try {
    // 1. Query Axiom logs using next-axiom
    const result = await log.query(`
      ['GitHub Webhook Handler']
      | sort(desc: timestamp)
      | limit(50)
    `);

    const rows = result?.data ?? [];

    // 2. Extract the logged webhook bodies
    const rawBodies = rows.map((row: any) => row.data?.body).filter(Boolean);

    // 3. Parse JSON safely
    const parsed = rawBodies
      .map((body: string) => {
        try {
          return JSON.parse(body);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // 4. Transform into normalized workflow events
    const events = parsed
      .map((p: any) => transformWorkflowRunEvent(p))
      .filter((e: any) => e && e.timestamp);

    return NextResponse.json(events);
  } catch (err) {
    console.error("GitHub Activity API Error:", err);
    return NextResponse.json(
      { error: "Failed to load GitHub activity" },
      { status: 500 }
    );
  }
}
