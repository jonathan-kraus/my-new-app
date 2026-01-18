import { NextResponse, NextRequest } from "next/server";
import { Axiom } from "@axiomhq/js";
import { log } from "next-axiom";
import crypto from "crypto";
import { logit } from "@/lib/log/server";
import { enrichContext } from "@/lib/log/context";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ctx = await enrichContext(req);

  await logit({
    ...ctx,
    level: "info",
    message: "in PING",
  });

  const payload = {
    ok: true,
    timestamp: new Date().toISOString(),
    server: process.env.NODE_ENV,
    requestId: crypto.randomUUID(),
  };

  // Create Axiom client
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN!,
  });

  //   let result;
  //   try {

  // result = await axiom.query(`

  // ['myapp_logs']
  // | limit 1
  //   `);

  //   } catch (err) {
  //     await logit({
  //       ...ctx,
  //       level: "error",
  //       message: "Axiom query failed",
  //       page: "Ping API",
  //       file: "app/api/ping/route.ts",
  //       data: {
  //         route: "ping",
  //         error: err instanceof Error ? err.message : String(err),
  //       },
  //     });
  //     throw err;
  //   }

  const query = `
    ['myapp_logs']
    | where message == "astronomy"
    | sort by _time desc
    | project
        _time,
        dataj.sunrisea,
        dataj.sunriseb,
        dataj.sunrisec,
        dataj.sunrised,
        dataj.sunrisee,
        dataj.sunrisef,
        dataj.sunriseg,
        dataj.fetchedAt
    | limit 50
  `;

  const result = await axiom.query(query);
  const rows = result?.matches ?? [];
  // Final log with correct duration
  await logit({
    ...ctx,
    level: "info",
    message: "ping completed",
    page: "Ping API",
    file: "app/api/ping/route.ts",

    data: rows,
  });
  return Response.json({ rows });
}
