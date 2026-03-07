// scripts/gen-commit-msg.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { generateCommitMessage } from "./generate-commit.js";

function getChangedFiles() {
  const output = execSync("git status --porcelain", { encoding: "utf8" });

  return output
    .split("\n")
    .filter(Boolean)
    .map(line => line.trim().split(/\s+/).pop()) // ← correct extraction
    .filter(file => !file.endsWith(".json"));
}

async function main() {
  try {
    const changedFiles = getChangedFiles();
    const commitMessage = await generateCommitMessage({ changedFiles });

    fs.writeFileSync(".git/COMMIT_MSG", commitMessage + "\n", "utf8");
    console.log("✔ Commit message generated.");
  } catch (err) {
    console.error("❌ Failed to generate commit message:", err);
    process.exit(1);
  }
}

main();
