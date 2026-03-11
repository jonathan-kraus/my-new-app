/*
 * @FilePath: \my-new-app\.husky\gen-commit-msg.js
 * @LastEditTime: 2026-03-01 18:45:58
 */
// scripts/gen-commit-msg.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { generateCommitMessage } from "./generate-commit.js";

function getChangedFiles() {
  const output = execSync("git status --porcelain", { encoding: "utf8" });
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().slice(3));
}

async function main() {
  const changedFiles = getChangedFiles();

  const msg = await generateCommitMessage({
    changedFiles,
  });

  const file = path.join(process.cwd(), ".git", "COMMIT_MSG");
  fs.writeFileSync(file, msg.trim() + "\n");

  console.log("Commit message written to .git/COMMIT_MSG");
}

main();
