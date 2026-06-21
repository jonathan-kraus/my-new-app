/*
 * @FilePath: \my-new-app\app\db\PgVersion.ts
 * @LastEditTime: 2026-06-20 23:49:25
 */
import { neon } from "@neondatabase/serverless";
import { NextRequest } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function getPostgresVersion(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  const built = buildUniversalContext(req as any, "PGVersion");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Validating Table existence",
    file: "page.tsx",
    line: 14,
    payload: { jei: jei, },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // No generics — Neon client in your setup does not accept them
  const result = await sql`
    SHOW server_version;
`;

  // result is an array of rows like: [{ server_version: "16.3" }]
  const row = result?.[0] as { server_version?: string } | undefined;

  return row?.server_version ?? "unknown";
}
