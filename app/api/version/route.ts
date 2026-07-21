import pkg from "../../../package.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "yaml";
import { execSync } from "node:child_process";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pkgName = searchParams.get("pkg");

  const base = {
    name: pkg.name,
    version: pkg.version,
    buildTime: process.env.BUILD_TIME ?? null,
    commit: safeCommit(),
  };

  // No ?pkg → return base info
  if (!pkgName) return Response.json(base);

  // ?pkg=all → return all dependencies + overrides
  if (pkgName === "all") {
    return Response.json({
      ...base,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      overrides: pkg.overrides ?? null,
    });
  }

  // ?pkg=resolved → return full lockfile
  if (pkgName === "resolved") {
    const lock = readLockfile();
    return Response.json({
      ...base,
      lockfileVersion: lock.lockfileVersion,
      resolved: lock.packages,
    });
  }

  // Lookup in dependencies + devDependencies
  const deps = pkg.dependencies as Record<string, string>;
  const devDeps = pkg.devDependencies as Record<string, string>;

  let version: string | null = deps?.[pkgName] ?? devDeps?.[pkgName] ?? null;

  // Lookup in pnpm overrides (correct location)
  const overrides = pkg.overrides as Record<string, string> | undefined;
  if (!version && overrides?.[pkgName]) {
    version = overrides[pkgName] ?? null;
  }

  // Lookup resolved version in pnpm-lock.yaml
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
