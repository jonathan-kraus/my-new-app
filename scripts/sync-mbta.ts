import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"], quiet: true });
// The Node import condition lets CLI scripts use server-only modules.
try {
  if (process.argv.includes("--dry-run")) {
    const { fetchMbtaCatalog } = await import("../src/lib/mbta/catalog-source");
    const catalog = await fetchMbtaCatalog();
    console.log(
      JSON.stringify(
        {
          routes: catalog.routes.length,
          stops: catalog.stops.length,
          patterns: catalog.patterns.length,
        },
        null,
        2,
      ),
    );
  } else {
    const { syncMbtaCatalog } = await import("../src/lib/mbta/sync");
    console.log(JSON.stringify(await syncMbtaCatalog(), null, 2));
  }
} catch (error) {
  console.error(
    "MBTA sync failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
} finally {
  if (!process.argv.includes("--dry-run")) {
    const { mbtaDb } = await import("../src/lib/mbta/db");
    await mbtaDb.close();
  }
}
