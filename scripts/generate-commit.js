/*
 * @FilePath: \my-new-app\scripts\generate-commit.js
 */

export async function generateCommitMessage({ changedFiles }) {
	const prompt = `
You are generating a commit message. Infer the commit type and tone from the changed files.
Keep it concise, meaningful, funny, and developer-friendly.

Completely ignore version.json. It is just an artifact of the build process and does not reflect any actual changes to the codebase. It should have zero influence on the commit message. Do not mention it at all.


Changed files:
${changedFiles.map((f) => `- ${f}`).join("\n")}

Write only the commit message. No explanations.
  `.trim();

	const response = await fetch("http://localhost:11434/api/generate", {
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
			if (!line.trim()) continue;

			const json = JSON.parse(line);
			if (json.response) full += json.response;
		}
	}

	return full.trim();
}
