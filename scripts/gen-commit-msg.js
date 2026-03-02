/*
 * @FilePath: \my-new-app\scripts\gen-commit-msg.js
 * @LastEditTime: 2026-03-01 18:31:31
 */
import fs from "fs";
import path from "path";
import { generateCommitMessage } from "./your-generator.js"; // your existing logic

async function main() {
  const msg = await generateCommitMessage();
  const file = path.join(process.cwd(), ".git", "COMMIT_MSG");
  fs.writeFileSync(file, msg.trim() + "\n");
  console.log("Commit message written to .git/COMMIT_MSG");
}

main();
