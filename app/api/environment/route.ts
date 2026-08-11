// app/api/environment/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // your Prisma client
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { getPostgresVersion } from "@/app/db/PgVersion";

export async function GET(nextReq: Request) {
  const built = await buildUniversalContext(nextReq as any, "environment");
  let jei = 0;

  await logj({
    domain: "environment",
    level: "info",
    message: "** Starting Environment Status Check **",
    file: "app\api\environment\route.ts",
    line: 12,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  try {
    //
    // 1. Get Postgres version directly from Neon (via Prisma)
    //
    const postgresVersion = await getPostgresVersion(1 as any);

    await logj({
      domain: "environment",
      level: "info",
      message: "Retrieved Postgres Version",
      file: "app\api\environment\route.ts",
      line: 28,
      payload: {
        pg: {
          version: postgresVersion,
          major: postgresVersion.split(".")[0],
          raw: postgresVersion,
        },
      },

      meta: { built: { ...built, eventIndex: ++jei } },
    });

    //
    // 2. Vercel project + deployment
    //
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
      file: "app\api\environment\route.ts",
      line: 61,
      payload: { vercelDeployment },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    //
    // 3. GitHub info from your GithubEvent table
    //
    const latestCommit = await db.githubEvent.findFirst({
      where: { type: "push" },
      orderBy: { createdAt: "desc" },
    });

    const latestWorkflow = await db.githubEvent.findFirst({
      where: { type: "workflow_run" },
      orderBy: { createdAt: "desc" },
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
            jobName: latestWorkflow.jobName,
            conclusion: latestWorkflow.conclusion,
            status: latestWorkflow.status,
            url: latestWorkflow.url,
          }
        : null,
    };
    await logj({
      domain: "environment",
      level: "info",
      message: "Retrieved GithubInfo",
      file: "app\api\environment\route.ts",
      line: 107,
      payload: { github },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    //
    // 4. NEW: Full Neon project metadata (console API)
    //
    const neonApiKey = process.env.NEON_API_KEY!;
    const neonOrgId = process.env.NEON_ORG_ID!;

    const neonRes = await fetch(
      `https://console.neon.tech/api/v2/projects?org_id=${neonOrgId}`,
      {
        headers: {
          Authorization: `Bearer ${neonApiKey}`,
          Accept: "application/json",
        },
      },
    );

    const neonJson = await neonRes.json();
    const project = neonJson.projects?.[0];

    const neon = project
      ? {
          id: project.id,
          name: project.name,
          orgId: project.org_id,
          region: project.region_id,
          platform: project.platform_id,
          pgVersion: project.pg_version,
          autoscaling: {
            min: project.default_endpoint_settings.autoscaling_limit_min_cu,
            max: project.default_endpoint_settings.autoscaling_limit_max_cu,
            suspendTimeout:
              project.default_endpoint_settings.suspend_timeout_seconds,
          },
          networking: {
            proxyHost: project.proxy_host,
            blockPublicConnections: project.settings.block_public_connections,
            allowedIPs: project.settings.allowed_ips.ips,
          },
          storage: {
            branchLogicalSizeLimit: project.branch_logical_size_limit,
            branchLogicalSizeLimitBytes:
              project.branch_logical_size_limit_bytes,
            syntheticStorageSize: project.synthetic_storage_size,
            quotaResetAt: project.quota_reset_at,
          },
          maintenance: {
            weekdays: project.settings.maintenance_window.weekdays,
            start: project.settings.maintenance_window.start_time,
            end: project.settings.maintenance_window.end_time,
          },
          replication: {
            logicalReplication: project.settings.enable_logical_replication,
          },
          timestamps: {
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            computeLastActiveAt: project.compute_last_active_at,
          },
          postgresVersion, // from Prisma
        }
      : { postgresVersion };
    await logj({
      domain: "environment",
      level: "info",
      message: "Retrieved Neon Info",
      file: "app\api\environment\route.ts",
      line: 177,
      payload: { neon },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    //
    // Final response
    //
    const payload = {
      pg: {
        raw: postgresVersion,
        major: postgresVersion.split(".")[0],
        version: postgresVersion,
      },
      vercel: {
        env: process.env.VERCEL_ENV ?? "unknown",
        region: process.env.VERCEL_REGION ?? "unknown",
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? "unknown",
        buildId: process.env.VERCEL_BUILD_ID ?? "unknown",
        gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
        gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
      },
      github: {
        runId: process.env.GITHUB_RUN_ID ?? null,
        runAttempt: latestWorkflow?.conclusion ?? null,
        workflow: process.env.GITHUB_WORKFLOW ?? null,
        sha: latestCommit?.commitSha ?? null,
        url: latestCommit?.url ?? null,
        status: latestWorkflow?.status ?? null,
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      app: {
        env: process.env.NODE_ENV,
        host: process.env.VERCEL_URL ?? "localhost",
      },
    };

    await logj({
      domain: "environment",
      level: "info",
      message: "Expanded environment payload",
      payload,
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return NextResponse.json({
      vercel: {
        project: vercelProject,
        latestDeployment: vercelDeployment,
      },
      neon,
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
