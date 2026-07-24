/*
 * @FilePath: \my-new-app\app\db\PgVersion.ts
 * @LastEditTime: 2026-07-17 15:25:36
 */
import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export async function getPostgresVersion(req: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  const built = await buildUniversalContext(req as any, "PGVersion");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Retrieving Postgres version from Neon (PGVersion.ts)",
    file: "PgVersion.ts",
    line: 14,
    payload: { jei: jei },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // No generics — Neon client in your setup does not accept them
  const result = await sql`
    SHOW server_version;
`;

  const row = result?.[0] as { server_version?: string } | undefined;

  return row?.server_version ?? "unknown";
}
