import dotenv from "dotenv";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

dotenv.config({ path: [".env.local", ".env"], quiet: true });

export default definePrismaConfig({
  orm: definePostgresConfig({
    // One-time adoption of the verified historical schema. Normal migrations
    // always use prisma.config.ts and the current application contract.
    contract: "prisma8/adoption-contract.ts",
    output:
      "migrations/snapshots/2ad2cc87de48ba7f1789e861ab63a9f3c13e78430786da2aa8046ee90d18e572",
    migrations: { dir: "migrations" },
    db: { connection: process.env.DATABASE_URL },
  }),
});
