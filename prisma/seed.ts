// prisma/seed.ts needed prisma8.ts for next line to work but will not go through CI with it
import { db8 } from "../src/lib/db.prisma8";

async function main() {
  const runtimeSettings = [
    { key: "email.enabled", value: "1" },
    { key: "solar.speed", value: "1000" },
    { key: "toast.enabled", value: "1" },
    { key: "debug.logging", value: "1" },
  ];
  const locations = [
    {
      id: "KOP",
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
    {
      id: "TPA",
      key: "TPA",
      name: "Tampa, FL",
      latitude: 27.9506,
      longitude: -82.4572,
      timezone: "America/New_York",
      isDefault: false,
    },
  ];

  await db8.transaction(async (tx) => {
    // Keep saved settings and locations intact when the seed is rerun.
    for (const setting of runtimeSettings) {
      const plan = db8.raw.sql`
        INSERT INTO "RuntimeConfig" ("key", "value", "updatedAt")
        VALUES (${setting.key}, ${setting.value}, timezone('UTC', now()))
        ON CONFLICT ("key") DO NOTHING
      `
        .affectedCount()
        .build();
      await tx.execute(plan);
    }

    for (const location of locations) {
      const plan = db8.raw.sql`
        INSERT INTO "Location"
          ("id", "key", "name", "latitude", "longitude", "timezone", "isDefault", "updatedAt")
        VALUES
          (${location.id}, ${location.key}, ${location.name}, ${location.latitude},
           ${location.longitude}, ${location.timezone}, ${location.isDefault}, timezone('UTC', now()))
        ON CONFLICT DO NOTHING
      `
        .affectedCount()
        .build();
      await tx.execute(plan);
    }
  });

  console.log("Seeded runtime settings and locations (including Tampa, FL)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db8.close();
  });
