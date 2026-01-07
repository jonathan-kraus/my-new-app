import { NextResponse } from "next/server";
import { transformWorkflowRunEvent } from "@/lib/github/transform";
import { axiom } from "@/lib/axiom"; // or wherever your log client lives

export async function GET() {
  try {
    // 1. Fetch raw GitHub webhook logs
    const logs = await axiom.query(`
      ['GitHub Webhook Handler']
      | sort(desc: timestamp)
      | limit(50)
    `);

    const rawEvents = logs.data?.map((row: any) => row.data) ?? [];

    // 2. Parse the stored JSON safely
    const parsedEvents = rawEvents
      .map((e: any) => {
        try {
          return JSON.parse(e.body);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // 3. Transform into normalized workflow_run events
    const transformed = parsedEvents
      .map((p: any) => transformWorkflowRunEvent(p))
      .filter(Boolean);

    // 4. Ensure every item has a timestamp (prevents UI crash)
    const safe = transformed.filter((e: any) => !!e.timestamp);

    return NextResponse.json(safe);
  } catch (err) {
    console.error("GitHub Activity API Error:", err);
    return NextResponse.json({ error: "Failed to load GitHub activity" }, { status: 500 });
  }
}
