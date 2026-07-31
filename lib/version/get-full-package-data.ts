import pkg from "../../package.json";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

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
    commit: safeCommit(),
    dependencies: (pkg.dependencies as Record<string, string>) ?? {},
    devDependencies: (pkg.devDependencies as Record<string, string>) ?? {},
    overrides: (pkg.overrides as Record<string, string>) ?? null,
    workspacePackages: scanWorkspacePackages(),
  };
}

/* -------------------------------------------------------------------------- */
/*                               Helpers                                      */
/* -------------------------------------------------------------------------- */

function normalizeEnv(value: string | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function safeCommit(): string | null {
  const vercel = process.env.VERCEL_GIT_COMMIT_SHA;
  if (typeof vercel === "string") return vercel;

  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return null;
  }
}

function scanWorkspacePackages() {
  const rootPkgPath = join(
    /*turbopackIgnore: true*/ process.cwd(),
    "package.json",
  );

  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
  const workspaces = rootPkg.workspaces ?? [];
  const results: Record<string, string> = {};

  for (const pattern of workspaces) {
    const base = join(
      /*turbopackIgnore: true*/ process.cwd(),
      pattern.replace("/*", ""),
    );

    if (!existsSync(/*turbopackIgnore: true*/ base)) continue;

    const entries = readdirSync(/*turbopackIgnore: true*/ base, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pkgPath = join(
        /*turbopackIgnore: true*/ base,
        entry.name,
        "package.json",
      );

      if (!existsSync(/*turbopackIgnore: true*/ pkgPath)) continue;

      try {
        const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"));
        results[pkgJson.name] = pkgJson.version ?? "unknown";
      } catch {
        results[entry.name] = "unknown";
      }
    }
  }

  return results;
}
