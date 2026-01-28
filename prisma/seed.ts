// prisma/seed.ts
import { db } from "../lib/db.ts";

async function runtime() {
  await db.runtimeConfig.createMany({
    data: [
      { key: "email.enabled", value: "1" },
      { key: "solar.speed", value: "1000" },
      { key: "toast.enabled", value: "1" },
      { key: "debug.logging", value: "1" },
    ],
    skipDuplicates: true,
  });
}
runtime();





