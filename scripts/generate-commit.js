/*
 * @FilePath: \my-new-app\scripts\generate-commit.js
 */

export async function generateCommitMessage({ changedFiles }) {
  const prompt = `
Generate a concise commit message based on these changed files:

${changedFiles.map(f => `- ${f}`).join("\n")}
  `.trim();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: true
    })
  });

  let full = "";

  for await (const chunk of response.body) {
    const text = new TextDecoder().decode(chunk);

    for (const line of text.split("\n")) {
      if (!line.trim()) continue;

      const json = JSON.parse(line);
      if (json.response) full += json.response;
    }
  }

  return full.trim();
}
