import dotenv from "dotenv";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

dotenv.config({ path: [".env.local", ".env"], quiet: true });

// An additive catalog contract: migrations never modify the existing app tables.
export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "prisma8/mbta.prisma",
    output: "generated/mbta",
    migrations: { dir: "mbta-migrations" },
    db: { connection: process.env.DATABASE_URL },
  }),
});
