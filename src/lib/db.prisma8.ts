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

export const db8 = postgres({
  contract,
  // The Prisma runtime reads the contract marker during app initialization.
  // Neon’s pooler rejects the startup option used by this driver, so use the
  // direct endpoint when available (same as Prisma CLI); keep pooled as fallback.
  url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
});
