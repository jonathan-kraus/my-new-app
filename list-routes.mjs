// list-routes.mjs
// Run from your project root: node list-routes.mjs

import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";

const APP_DIR = "./app";

async function getComment(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n").slice(0, 5); // check first 5 lines
    for (const line of lines) {
      const match = line.match(/\/\/\s*(app\/.+)/);
      if (match) return match[1].trim();
    }
  } catch {}
  return null;
}

async function findRoutes(dir, routes = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip Next.js special folders and node_modules
      if (
        ["node_modules", "_components", "_lib", "_hooks", "api"].includes(
          entry.name,
        )
      )
        continue;
      // Skip private folders (prefixed with _) and route groups (wrapped in parens)
      if (entry.name.startsWith("_")) continue;
      await findRoutes(fullPath, routes);
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      const relativePath = relative(APP_DIR, dir);
      const route = "/" + relativePath.replace(/\\/g, "/");
      const comment = await getComment(fullPath);
      routes.push({
        route: route === "/." ? "/" : route,
        file: fullPath,
        comment,
      });
    }
  }

  return routes;
}

const routes = await findRoutes(APP_DIR);

routes.sort((a, b) => a.route.localeCompare(b.route));

console.log("\n📁 App Routes\n" + "─".repeat(60));

for (const { route, file, comment } of routes) {
  const label = comment ? `  ← ${comment}` : "";
  console.log(`  ${route.padEnd(40)} ${file}${label}`);
}

console.log("─".repeat(60));
console.log(`  ${routes.length} route(s) found\n`);
