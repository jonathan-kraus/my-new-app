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

### Style Requirements
- The commit message MUST be funny.
- Dry humor, sarcasm, self‑deprecation, or chaotic‑developer energy is welcome.
- Keep it short, punchy, and clever.
- Do NOT mention JSON files under any circumstances.
- Output ONLY the commit message text. No explanations.

### Changed files (JSON removed):
${fileList}

### Additional Rules
- If the changes are tiny, make a joke about overengineering.
- If the changes are unclear, blame "past me" or "future me".
- If it's an API route, pretend it has feelings.
- If all else fails, output something like:
  "chore: mysterious code rituals performed"

Now generate a funny commit message:
`;

  return runOllama(prompt);
}
