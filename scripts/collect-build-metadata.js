/*
 * @FilePath: \my-new-app\scripts\collect-build-metadata.js
 * @LastEditTime: 2026-07-29 01:02:20
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

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
    const pkgJson = require(`${pkg}/package.json`);
    return pkgJson.version ?? "unknown";
  } catch {
    return "unknown";
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
