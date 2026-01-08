import { NextResponse } from "next/server";
import { transformWorkflowRunEvent } from "@/lib/github/transform";

export async function GET() {
  try {
    const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
    const AXIOM_DATASET = process.env.AXIOM_DATASET;

    if (!AXIOM_TOKEN || !AXIOM_DATASET) {
      return NextResponse.json(
        { error: "Missing AXIOM_TOKEN or AXIOM_DATASET" },
        { status: 500 },
      );
    }

    // Axiom query to fetch your webhook logs.
    const query = `
      ['GitHub Webhook Handler']
      | sort(desc: timestamp)
      | limit(50)
    `;

    const response = await fetch(
      `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AXIOM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
    );

    const json = await response.json();
    const rows = json?.data ?? [];

    // Extract the logged webhook bodies
    const rawBodies = rows.map((row: any) => row.data?.body).filter(Boolean);

    // Parse JSON safely
    const parsed = rawBodies
      .map((body: string) => {
        try {
          return JSON.parse(body);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Transform into normalized workflow events
    const events = parsed
      .map((p: any) => transformWorkflowRunEvent(p))
      .filter((e: any) => e && e.timestamp);

    return NextResponse.json(events);
  } catch (err) {
    console.error("GitHub Activity API Error:", err);
    return NextResponse.json(
      { error: "Failed to load GitHub activity" },
      { status: 500 },
    );
  }
}
