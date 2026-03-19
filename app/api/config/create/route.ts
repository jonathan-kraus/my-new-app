/*
 * @FilePath: \my-new-app\app\api\config\create\route.ts
 * @LastEditTime: 2026-03-18 23:12:48
 */
import { axiomIngest } from "@/lib/axiom";
import { NextResponse } from "next/server";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logit } from "@/lib/log/logit";

export async function POST(request: Request) {
  const built = await buildUniversalContext("api\config\create\route.ts");
    await logit(
      "jonathan",
      {
        level: "info",
        message: "In api\config\create\route.ts",
      },
      {
      somedata: "some data",
      },
      {
        built,
      },
    );
  const body = await request.json();
  const dataset = body.dataset ?? process.env.AXIOM_DATASET;
  const events = Array.isArray(body.events) ? body.events : [body];

  console.log("[api/config/create] body", JSON.stringify(body));
  console.log("[api/config/create] dataset", dataset);
  console.log("[api/config/create] events", events.length, events[0]);

  try {
    const response = await axiomIngest(events, dataset);
    console.log("AXIOM INGEST RESPONSE", response);
    return NextResponse.json({ ok: true, dataset, count: events.length });
  } catch (error) {
    console.error("axiom ingestion failed", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
