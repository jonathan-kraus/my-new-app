/*
 * @FilePath: \my-new-app\src\lib\db.prisma8.ts
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-09-19 16:02:49
 */
import "temporal-polyfill/full/global";
import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../generated/prisma8/contract.d";
import contractJson from "../../generated/prisma8/contract.json" with { type: "json" };
export const db8 = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});
