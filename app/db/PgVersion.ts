/*
 * @FilePath: \my-new-app\app\db\PgVersion.ts
 * @LastEditTime: 2026-07-17 15:25:36
 */
import { neon } from "@neondatabase/serverless";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { logj } from "@/lib/log/logj";

export async function getPostgresVersion(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  const built = await buildUniversalContext(req, "PGVersion");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "Retrieving Postgres version from Neon (PGVersion.ts)",
    file: "app/db/PgVersion.ts",
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
