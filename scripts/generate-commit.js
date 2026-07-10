/*
 * @FilePath: \my-new-app\scripts\generate-commit.js
 */

export async function generateCommitMessage({ changedFiles }) {
  const prompt = `
You are generating a commit message. Infer the commit type and tone from the changed files.
Keep it concise, meaningful, funny and developer-friendly. Do not use refactor in every message.

Changed files:
${changedFiles.map((f) => `- ${f}`).join("\n")}

Write only the commit message. No explanations.
  `.trim();

  const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: true,
    }),
  });
  let full = "";

  for await (const chunk of response.body) {
    const text = new TextDecoder().decode(chunk);

    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Only attempt to parse JSON objects
      if (!trimmed.startsWith("{")) continue;

      try {
        const json = JSON.parse(trimmed);
        if (typeof json.response === "string") {
          full += json.response;
        }
      } catch {
        // Ignore malformed JSON lines
        continue;
      }
    }
  }

  return full.trim();
}
