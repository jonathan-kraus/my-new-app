/*
 * @FilePath: \my-new-app\lib\version\get-full-package-data.ts
 * @LastEditTime: 2026-08-21 14:42:29
 */
import pkg from "../../package.json";
export type FullPackageData = {
  name: string;
  version: string;
  buildTime: string | null;
  commit: string | null;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  overrides: Record<string, string> | null;
  workspacePackages: Record<string, string>;
};

export function getFullPackageData(): FullPackageData {
  return {
    name: pkg.name,
    version: pkg.version,
    buildTime: normalizeEnv(process.env.BUILD_TIME),
    commit: resolveCommit(),
    dependencies: (pkg.dependencies as Record<string, string>) ?? {},
    devDependencies: (pkg.devDependencies as Record<string, string>) ?? {},
    overrides: (pkg.overrides as Record<string, string>) ?? null,
    workspacePackages: resolveWorkspacePackages(),
  };
}

/* -------------------------------------------------------------------------- */
/*                               Helpers                                      */
/* -------------------------------------------------------------------------- */

function normalizeEnv(value: string | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function resolveCommit(): string | null {
  // Prefer Vercel/CI env
  const vercel = process.env.VERCEL_GIT_COMMIT_SHA;
  if (typeof vercel === "string" && vercel.length > 0) return vercel;

  const generic = process.env.GIT_COMMIT_SHA;
  if (typeof generic === "string" && generic.length > 0) return generic;

  // No git in serverless prod; don’t try execSync there.
  if (process.env.NODE_ENV === "production") return null;

  // Dev fallback: try local git
  try {
    const { execSync } = require("node:child_process");
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return null;
  }
}

function resolveWorkspacePackages(): Record<string, string> {
  // In prod, never touch the filesystem.
  if (process.env.NODE_ENV === "production") {
    return {};
  }

  // Dev-only scanning (optional)
  try {
    const { existsSync, readdirSync, readFileSync } = require("node:fs");
    const { join } = require("node:path");

    // Your root package.json does NOT have workspaces,
    // so we safely default to an empty array.
    const workspaces: string[] = [];

    const results: Record<string, string> = {};

    for (const pattern of workspaces) {
      const base = join(process.cwd(), pattern.replace("/*", ""));
      if (!existsSync(base)) continue;

      const entries = readdirSync(base, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pkgPath = join(base, entry.name, "package.json");
        if (!existsSync(pkgPath)) continue;

        try {
          const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"));
          results[pkgJson.name] = pkgJson.version ?? "unknown";
        } catch {
          results[entry.name] = "unknown";
        }
      }
    }

    return results;
  } catch {
    return {};
  }
}
