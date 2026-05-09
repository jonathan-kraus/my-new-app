/*
 * @FilePath: \my-new-app\scripts\gen-commit-msg.js
 * @LastEditTime: 2026-05-09 12:25:14
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { generateCommitMessage } from "./generate-commit.js";

function getChangedFiles() {
  const output = execSync("git status --porcelain", { encoding: "utf8" });

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().split(/\s+/).pop()) // correct filename extraction
    .filter((file) => !file.endsWith(".json")); // remove ALL .json files
}

async function main() {
  const changedFiles = getChangedFiles();

  const msg = await generateCommitMessage({
    changedFiles,
  });

  const file = path.join(process.cwd(), ".git", "COMMIT_MSG");
  fs.writeFileSync(file, msg.trim() + "\n");

  console.log("Commit message written to .git/COMMIT_MSG ");
}

main();
