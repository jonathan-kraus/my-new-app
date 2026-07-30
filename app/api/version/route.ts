import pkg from "../../../package.json";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import yaml from "yaml";
import { execSync } from "node:child_process";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pkgName = searchParams.get("pkg");

  const base = {
    name: pkg.name,
    version: pkg.version,
    buildTime: normalizeEnv(process.env.BUILD_TIME),
    commit: safeCommit(),
  };

  if (!pkgName) return Response.json(base);

  if (pkgName === "all") {
    return Response.json({
      ...base,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      overrides: pkg.overrides ?? null,
      workspacePackages: scanWorkspacePackages(),
    });
  }

  if (pkgName === "resolved") {
    const lock = readLockfile();
    return Response.json({
      ...base,
      lockfileVersion: lock.lockfileVersion,
      resolved: lock.packages,
    });
  }

  const deps = pkg.dependencies as Record<string, string>;
  const devDeps = pkg.devDependencies as Record<string, string>;
  let version: string | null = deps?.[pkgName] ?? devDeps?.[pkgName] ?? null;

  const overrides = pkg.overrides as Record<string, string> | undefined;
  if (!version && overrides?.[pkgName]) {
    version = overrides[pkgName] ?? null;
  }

  if (!version) {
    const lock = readLockfile();
    const resolved = lock.packages;

    const match = Object.keys(resolved).find((key) =>
      key.startsWith(`/${pkgName}@`),
    );

    if (match) {
      version = match.split("@")[1] ?? null;
    }
  }

  return Response.json({
    ...base,
    package: pkgName,
    version,
  });
}

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

function readLockfile() {
  const lockPath = join(
    /*turbopackIgnore: true*/ process.cwd(),
    "pnpm-lock.yaml",
  );
  return yaml.parse(readFileSync(lockPath, "utf8"));
}

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
