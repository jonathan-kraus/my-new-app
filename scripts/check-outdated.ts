/*
 * @FilePath: \my-new-app\scripts\check-outdated.ts
 * @LastEditTime: 2026-08-04 21:53:55
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

const ignore = new Set(["typescript"]);

const filtered = Object.fromEntries(
  Object.entries(data).filter(([name]) => !ignore.has(name)),
);

if (Object.keys(filtered).length) {
  console.log("Outdated (filtered):");
  console.log(JSON.stringify(filtered, null, 2));
  process.exit(1);
}
console.log("✓ No outdated dependencies");
