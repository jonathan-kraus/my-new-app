import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "yaml";
import pkg from "../../../package.json"; // keep this if you still need it for single-package lookup

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pkgName = searchParams.get("pkg");

  const full = getFullPackageData();

  // 1. No query → just base info
  if (!pkgName) {
    const {
      dependencies,
      devDependencies,
      overrides,
      workspacePackages,
      ...base
    } = full;
    return Response.json(base);
  }

  // 2. ?pkg=all → everything
  if (pkgName === "all") {
    return Response.json(full);
  }

  // 3. ?pkg=resolved → lockfile resolved packages
  if (pkgName === "resolved") {
    const lock = readLockfile();
    return Response.json({
      name: full.name,
      version: full.version,
      buildTime: full.buildTime,
      commit: full.commit,
      lockfileVersion: lock.lockfileVersion,
      resolved: lock.packages,
    });
  }

  // 4. Single package lookup
  const deps = full.dependencies;
  const devDeps = full.devDependencies;
  let version: string | null = deps?.[pkgName] ?? devDeps?.[pkgName] ?? null;

  if (!version && full.overrides?.[pkgName]) {
    version = full.overrides[pkgName] ?? null;
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
    name: full.name,
    version: full.version, // app version
    buildTime: full.buildTime,
    commit: full.commit,
    package: pkgName,
    resolvedVersion: version, // the specific package version
  });

  /* -------------------------------------------------------------------------- */
  /*                               Helpers                                      */
  /* -------------------------------------------------------------------------- */

  function readLockfile() {
    const lockPath = join(
      /*turbopackIgnore: true*/ process.cwd(),
      "pnpm-lock.yaml",
    );
    return yaml.parse(readFileSync(lockPath, "utf8"));
  }
}
