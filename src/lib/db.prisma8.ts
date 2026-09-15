/*
 * @FilePath: \my-new-app\src\lib\db.prisma8.ts
 * @LastEditors: Jonathan
 * @LastEditTime: 2026-09-15 01:46:48
 */
import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../generated/prisma8/contract.d";
import contractJson from "../../generated/prisma8/contract.json" with { type: "json" };

export const db8 = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
