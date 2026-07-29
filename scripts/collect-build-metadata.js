/*
 * @FilePath: \my-new-app\scripts\collect-build-metadata.js
 * @LastEditTime: 2026-07-29 15:31:06
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const projectRoot = path.resolve(__dirname, "..");
function run(cmd) {
  try {
    return execSync(cmd).toString().trim();
  } catch {
    return "unknown";
  }
}

// Safe resolver for packages without a CLI (or when CLI output is messy)
function safeVersion(pkg) {
  try {
    const pkgJsonPath = require.resolve(`${pkg}/package.json`, {
      paths: [projectRoot],
    });
    const pkgJson = require(pkgJsonPath);
    return pkgJson.version ?? "Junknown";
  } catch (err) {
    console.log("Failed to resolve", pkg, err);
    return "Kunknown";
  }
}

const metadata = {
  timestamp: new Date().toISOString(),
  git: {
    commit: run("git rev-parse HEAD"),
    branch: run("git rev-parse --abbrev-ref HEAD"),
  },
  tools: {
    node: run("node --version"),
    pnpm: run("pnpm --version"),
    next: run("pnpm exec next --version"),
    typescript: run("pnpm exec tsc --version"),
    eslint: run("pnpm exec eslint --version"),

    // ⭐ Added: openmeteo
    openmeteo: safeVersion("openmeteo"),

    // ⭐ Added: prisma (recommended: package.json version)
    prisma: safeVersion("prisma"),
  },
};

const outDir = path.join(process.cwd(), ".version");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "build.json"),
  JSON.stringify(metadata, null, 2),
);

console.log("Build metadata written to .version/build.json");
