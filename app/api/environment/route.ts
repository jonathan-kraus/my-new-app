// app\api\environment\route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // your Prisma client
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
export async function GET(nextReq: Request) {
  const built = await buildUniversalContext(nextReq as any, "environment");
  let jei = 0;
  await logj({
    domain: "environment",
    level: "info",
    message: "Starting Envionment Status Check",
    file: "app/api/environment/route.ts",
    line: 9,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  try {
    // 1. Get Postgres version directly from Neon
    const versionResult =
      await db.$queryRawUnsafe<{ server_version: string }[]>(
        `SHOW server_version;`,
      );

    const postgresVersion = versionResult[0]?.server_version ?? "unknown";
    await logj({
      domain: "environment",
      level: "info",
      message: "Retrieved Postgres Version",
      file: "app/api/environment/route.ts",
      line: 26,
      payload: { postgresVersion: postgresVersion },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
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
    await logj({
      domain: "environment",
      level: "info",
      message: "Retrieved Vercel Info",
      file: "app/api/environment/route.ts",
      line: 48,
      payload: { vercelDeployment: vercelDeployment },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    // 3. GitHub info from your GithubEvent table
    const latestCommit = await db.githubEvent.findFirst({
      where: {
        type: "push",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const latestWorkflow = await db.githubEvent.findFirst({
      where: {
        type: "workflow_run",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const github = {
      latestCommit: latestCommit
        ? {
            commit: {
              message: latestCommit.commitMessage,
              author: { name: latestCommit.actor },
            },
            sha: latestCommit.commitSha,
            url: latestCommit.url,
          }
        : null,

      latestWorkflow: latestWorkflow
        ? {
            name:
              latestWorkflow.title ?? latestWorkflow.jobName ?? "workflow_run",
            conclusion: latestWorkflow.conclusion,
            status: latestWorkflow.status,
            url: latestWorkflow.url,
          }
        : null,
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
