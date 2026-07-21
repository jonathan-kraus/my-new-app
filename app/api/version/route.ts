/*
 * @FilePath: \my-new-app\app\api\version\route.ts
 * @LastEditTime: 2026-07-21 16:34:12
 */
import pkg from "../../../package.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "yaml";
import { execSync } from "node:child_process";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pkgName = searchParams.get("pkg");

  // Base info
  const base = {
    name: pkg.name,
    version: pkg.version,
    buildTime: process.env.BUILD_TIME ?? null,
    commit: safeCommit(),
  };

  // If no ?pkg param → return base info
  if (!pkgName) return Response.json(base);

  // ?pkg=all → return all dependencies
  if (pkgName === "all") {
    return Response.json({
      ...base,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
    });
  }

  // ?pkg=resolved → return resolved versions from pnpm-lock.yaml
  if (pkgName === "resolved") {
    const lock = readLockfile();
    return Response.json({
      ...base,
      lockfileVersion: lock.lockfileVersion,
      resolved: lock.packages,
    });
  }

// Otherwise: return specific package version
const deps = pkg.dependencies as Record<string, string>;
const devDeps = pkg.devDependencies as Record<string, string>;

const version =
  deps?.[pkgName] ??
  devDeps?.[pkgName] ??
  null;

return Response.json({
  ...base,
  package: pkgName,
  version,
});
}

// Helpers
function readLockfile() {
  const lockPath = join(process.cwd(), "pnpm-lock.yaml");
  return yaml.parse(readFileSync(lockPath, "utf8"));
}

function safeCommit() {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return null;
  }
}
