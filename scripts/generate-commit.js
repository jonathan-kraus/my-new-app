// scripts/generate-commit.js
import { execSync } from "child_process";

function runOllama(prompt) {
  const safe = prompt.replace(/"/g, '\\"');
  const result = execSync(
    `echo "${safe}" | ollama run llama3.1:8b`,
    { encoding: "utf8" }
  );
  return result.trim();
}

export async function generateCommitMessage({ changedFiles }) {
  const filtered = changedFiles.filter(f => !f.endsWith(".json"));

  const fileList =
    filtered.length > 0
      ? filtered.map(f => `- ${f}`).join("\n")
      : "(no non‑JSON files changed)";

  const prompt = `
You are generating a commit message for a Git repository.

### Requirements
- Keep it concise and meaningful.
- Do NOT mention JSON files.
- Output ONLY the commit message.

### Changed files:
${fileList}

Generate the commit message now:
`;

  return runOllama(prompt);
}
