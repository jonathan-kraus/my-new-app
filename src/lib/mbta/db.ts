import "server-only";
import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../../generated/mbta/contract.d";
import contractJson from "../../../generated/mbta/contract.json" with { type: "json" };

export const mbtaDb = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL!,
});
