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
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.neon.tech/v2/projects/${neonProjectId}`,
    {
      headers: {
        Authorization: `Bearer ${neonApiKey}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();

    await logj({
      level: "error",
      domain: "environment",
      message: "Neon API request failed",
      payload: {
        status: res.status,
        body: text,
      },
    });

    return Response.json(
      { error: "Neon API request failed", status: res.status },
      { status: 500 }
    );
  }

  const data = await res.json();

  await logj({
    level: "info",
    domain: "environment",
    message: "Neon API request succeeded",
    payload: {
      projectName: data.project?.name ?? null,
    },
  });

  return Response.json(data);
}
