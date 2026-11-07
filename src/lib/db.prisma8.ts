/*
 * @FilePath: \my-new-app\src\lib\db.prisma8.ts
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-09-19 16:02:49
 */
import "temporal-polyfill/full/global";
import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../generated/prisma8/contract.d";
import contractJson from "../../generated/prisma8/contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

function getRuntimeDatabaseUrl(): string {
  const directUrl = process.env["DIRECT_URL"];
  if (directUrl) return directUrl;

  const databaseUrl = process.env["DATABASE_URL"]!;
  const url = new URL(databaseUrl);

  // Neon marks pooled endpoints with `-pooler` in the hostname. The Prisma
  // runtime sends startup parameters PgBouncer rejects, so derive its direct
  // endpoint when a separate DIRECT_URL is not configured (such as in CI).
  if (url.hostname.endsWith(".neon.tech") && url.hostname.includes("-pooler.")) {
    url.hostname = url.hostname.replace("-pooler.", ".");
    url.searchParams.delete("pgbouncer");
    return url.toString();
  }

  return databaseUrl;
}

export const db8 = postgres({
  contract,
  url: getRuntimeDatabaseUrl(),
});
