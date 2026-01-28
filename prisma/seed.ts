// prisma/seed.ts
import { db } from "../lib/db";

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



async function main() {
  // Clear existing locations (optional but safe for dev)
  await db.location.deleteMany();

  await db.location.createMany({
    data: [
      {
        id: "KOP", // optional: you can use cuid() instead
        key: "KOP",
        name: "King of Prussia, PA",
        latitude: 40.0893,
        longitude: -75.3836,
        timezone: "America/New_York",
        isDefault: true,
      },
      {
        id: "BKL",
        key: "BKL",
        name: "Brookline, MA",
        latitude: 42.3318,
        longitude: -71.1212,
        timezone: "America/New_York",
        isDefault: false,
      },
      {
        id: "WIL",
        key: "WIL",
        name: "Williamstown, MA",
        latitude: 42.712,
        longitude: -73.2037,
        timezone: "America/New_York",
        isDefault: false,
      },
    ],
  });

  console.log("🌱 Seeded locations successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });



