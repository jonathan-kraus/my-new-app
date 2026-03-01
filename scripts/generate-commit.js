/*
 * @FilePath: \my-new-app\scripts\generate-commit.js
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-01 02:32:00
 */

import { execSync } from "child_process";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

const diff = run("git diff --staged");

if (!diff) {
  console.log("No staged changes.");
  process.exit(0);
}

const prompt = `
Generate a concise, high‑quality Git commit message summarizing the following diff.
Use imperative mood. No preface. No quotes. No explanations.

Diff:
${diff}
`;

const response = run(`echo ${JSON.stringify(prompt)} | ollama run llama3.2`);
console.log(response);
