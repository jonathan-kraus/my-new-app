/*
 * @FilePath: \my-new-app\lib\travel\ingest\route.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-22 13:11:05
 * @Description  :
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-11 01:23:43
 */
import { NextResponse } from "next/server";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const built = await buildUniversalContext(req as any, "travel-ingest");
  let jei = 0;

  await logj({
    domain: "jonathan",
    level: "info",
    message: "travel-ingest-start",
    file: "lib/travel/ingest/route.ts",
    line: 19,
    payload: {
      url: req.url,
      someatent: "somevalue",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const result = await ingestTravelEmails();

  await logj({
    domain: "jonathan",
    level: "info",
    message: "travel-ingest-end",
    file: "lib/travel/ingest/route.ts",
    line: 33,
    payload: {
      result,
      someatent: "somevalue",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  return NextResponse.json({ ok: true, result });
}
