import { logj } from "@/lib/log/logj";

export async function GET() {
  const neonApiKey = process.env.NEON_API_KEY;
  const neonProjectId = process.env.NEON_PROJECT_ID;

  // Log what we actually received (safe)
  await logj({
    level: "info",
    domain: "environment",
    message: "Checking Neon environment variables",
    payload: {
      projectId: neonProjectId ?? null,
      apiKeyPrefix: neonApiKey ? neonApiKey.slice(0, 6) : null,
    },
  });

  if (!neonApiKey || !neonProjectId) {
    await logj({
      level: "error",
      domain: "environment",
      message: "Missing Neon environment variables",
      payload: { neonApiKey, neonProjectId },
    });

    return Response.json(
      { error: "Missing Neon environment variables" },
      { status: 500 },
    );
  }

  // const res = await fetch(
  //   `https://api.neon.tech/v2/projects/${neonProjectId}`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${neonApiKey}`,
  //     },
  //   },
  // );
  const res = await fetch("https://api.neon.tech/v2/projects", {
    headers: {
      Authorization: `Bearer ${neonApiKey}`,
    },
  });

  const raw = await res.text();

  await logj({
    level: "info",
    domain: "environment",
    message: "Neon API raw response",
    payload: { raw },
  });

  if (!res.ok) {
    return Response.json(
      { error: "Neon API request failed", status: res.status, raw },
      { status: 500 },
    );
  }

  const parsed = JSON.parse(raw);

  await logj({
    level: "info",
    domain: "environment",
    message: "Neon API request succeeded",
    payload: {
      projectName: parsed.project?.name ?? null,
    },
  });

  return Response.json(parsed);
}
