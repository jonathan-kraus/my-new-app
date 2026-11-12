/*
 * @FilePath: \my-new-app\prisma.config.ts
 * @LastEditTime: 2026-09-15 00:54:39
 */

import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";
import dotenv from "dotenv";
import { definePrismaConfig } from "prisma/config";

dotenv.config({ path: [".env.local", ".env"], quiet: true });

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "prisma8/contract.prisma",
    output: "generated/prisma8",
    migrations: { dir: "migrations" },
    db: {
      // Prisma CLI commands need Neon's direct endpoint; keep DATABASE_URL pooled for the app.
      connection: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    },
  }),
});
