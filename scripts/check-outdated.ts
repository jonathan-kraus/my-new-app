/*
 * @FilePath: \my-new-app\scripts\check-outdated.ts
 * @LastEditTime: 2026-10-07 23:13:06
 */
import { execSync } from "node:child_process";

type OutdatedEntry = {
  current: string;
  latest: string;
  wanted: string;
  isDeprecated?: boolean;
  dependencyType?: string;
};

let raw = "";

try {
  raw = execSync("pnpm outdated --json", { encoding: "utf8" });
} catch (error) {
  const err = error as {
    stdout?: string | Buffer;
    stderr?: string | Buffer;
    status?: number;
  };

  raw = typeof err.stdout === "string" ? err.stdout : String(err.stdout ?? "");

  if (!raw.trim()) {
    const stderr =
      typeof err.stderr === "string" ? err.stderr : String(err.stderr ?? "");
    throw new Error(
      `Failed to run pnpm outdated (exit ${err.status ?? "unknown"}): ${stderr}`,
    );
  }
}

const data = JSON.parse(raw || "{}") as Record<string, OutdatedEntry>;
const exclusions = {
  latestVersions: new Set(["8.0.0-rc.11"]),
  names: new Set(["prisma", "@prisma/orm-postgres", "typescript"]),
};
const filtered = Object.fromEntries(
  Object.entries(data).filter(([name, pkg]) => {
    return (
      !exclusions.names.has(name) && !exclusions.latestVersions.has(pkg.latest)
    );
  }),
);

if (Object.keys(filtered).length) {
  console.log("Outdated (filtered):");
  console.log(JSON.stringify(filtered, null, 2));
  process.exit(1);
} else {
  console.log("✓✓ No outdated dependencies found (after filtering).");
  process.exit(0);
}
