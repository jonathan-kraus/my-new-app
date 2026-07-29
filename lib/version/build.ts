/*
 * @FilePath: \my-new-app\lib\version\build.ts
 * @LastEditTime: 2026-07-22 13:11:10
 */
import fs from "fs";
import path from "path";

export type BuildMetadata = {
  timestamp: string;
  git: {
    commit: string;
    branch: string;
  };
  tools: {
    node: string;
    pnpm: string;
    next: string;
    typescript: string;
    eslint: string;
    openmeteo: string;
    prisma: string;
  };
};

export function getBuildMetadata() {
  try {
    const file = path.join(process.cwd(), ".version/build.json");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}
