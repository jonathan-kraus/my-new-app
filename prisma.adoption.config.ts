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
      "migrations/snapshots/095c12ed1e8b26897e2a1e7573009635ae889450806cefb2db40a9c04c066e7a",
    migrations: { dir: "migrations" },
    db: { connection: process.env.DATABASE_URL },
  }),
});
