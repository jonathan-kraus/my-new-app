// app/api/activity/github/route.ts
import { NextResponse } from "next/server";
import { log } from "next-axiom";
import { logit } from "@/lib/log/server";

export async function GET() {
  try {
    // Query your new filtered dataset
    const result = await log.query("github_events", {
      limit: 20,
      order: "desc",
      filter: "",
    });

    const rows = result?.data ?? [];

    // Local log for debugging
    await logit({
      level: "info",
      message: "Fetched GitHub activity",
      data: { count: rows.length },
    });

    return NextResponse.json(rows);
  } catch (err: any) {
    await logit({
      level: "error",
      message: "GitHub activity fetch failed",
      data: { error: err.message },
    });

    return NextResponse.json([], { status: 500 });
  }
}
