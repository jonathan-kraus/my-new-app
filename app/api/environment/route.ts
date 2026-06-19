import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // your Prisma client

export async function GET() {
  try {
    // 1. Get Postgres version directly from Neon
    const versionResult =
      await db.$queryRawUnsafe<{ server_version: string }[]>(
        `SHOW server_version;`,
      );

    const postgresVersion = versionResult[0]?.server_version ?? "unknown";

    // 2. Vercel project + deployment
    const vercelProject = {
      name: process.env.VERCEL_PROJECT_NAME ?? "unknown",
      TeamId: process.env.VERCEL_TEAM_ID ?? "unknown",
    };

    const vercelDeployment = {
      url: process.env.VERCEL_URL ?? "unknown",
      state: "active",
      meta: {
        githubCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "unknown",
      },
    };

    // 3. GitHub info (placeholder — you can wire real API later)
    const github = {
      latestCommit: {
        commit: {
          message: process.env.GITHUB_COMMIT_MESSAGE ?? "unknown",
          author: { name: process.env.GITHUB_COMMIT_AUTHOR ?? "unknown" },
        },
      },
      latestWorkflow: {
        name: "N/A",
        conclusion: "N/A",
      },
    };

    return NextResponse.json({
      vercel: {
        project: vercelProject,
        latestDeployment: vercelDeployment,
      },
      neon: {
        postgresVersion,
      },
      github,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load environment", details: String(err) },
      { status: 500 },
    );
  }
}
