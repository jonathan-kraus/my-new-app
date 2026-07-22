/*
 * @FilePath: \my-new-app\scripts\collect-build-metadata.js
 * @LastEditTime: 2026-07-22 13:07:24
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
  },
};

const outDir = path.join(process.cwd(), ".version");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "build.json"),
  JSON.stringify(metadata, null, 2),
);

console.log("Build metadata written to .version/build.json");
