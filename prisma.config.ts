/*
 * @FilePath: \my-new-app\prisma.config.ts
 * @LastEditTime: 2026-09-15 00:54:39
 */
import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "prisma8/contract.prisma",
    output: "generated/prisma8",
    db: {
      connection: process.env["DATABASE_URL"],
    },
  }),
});
