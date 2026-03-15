// app/api/log-test/route.ts
import { NextResponse } from "next/server";
import { axiomIngest } from "@/lib/axiom";

export async function GET() {
  const timestamp = new Date().toISOString();

  const event = {
    domain: "notes",
    level: "info",
    jzulu: new Date().toISOString(),
    message: "#1 Notes GET completed TEST",
    eventIndex: 1,
    payload_json: JSON.stringify({
      eventIndex: 1,
      level: "info",
      message: "Notes GET completed TEST",
      payload: { count: 999 },
    }),
    meta_json: JSON.stringify({
      requestId: "test-request-id",
      page: null,
      userId: null,
    }),
    _time: timestamp,
  };

  try {
    await axiomIngest([event]);
    return NextResponse.json({ ok: true, sent: event });
  } catch (err) {
    console.error("AXIOM INGEST ERROR", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
