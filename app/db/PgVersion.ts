/*
 * @FilePath: \my-new-app\app\db\PgVersion.ts
 * @LastEditTime: 2026-06-20 17:43:08
 */
import { neon } from "@neondatabase/serverless";

export async function getPostgresVersion() {
  const sql = neon(process.env.DATABASE_URL!);

  // No generics — Neon client in your setup does not accept them
  const result = await sql`
    SHOW server_version;
`;

  // result is an array of rows like: [{ server_version: "16.3" }]
  const row = result?.[0] as { server_version?: string } | undefined;

  return row?.server_version ?? "unknown";
}
