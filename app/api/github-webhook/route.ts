export const runtime = "nodejs";

import crypto from "crypto";
import { Axiom } from "@axiomhq/js";
import { logit } from "@/lib/log/logit";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { getSha } from "@/lib/github/parse";
import { getCommitMessage } from "@/lib/github";
import { db } from "@/lib/db";

const gw = Number(await getConfig("github_webhook", "0"));
const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });

const ctx = {
  requestId: crypto.randomUUID(),
  route: "Github Webhook",
  page: "workflow",
  userId: "JK",
};

/* -------------------------------------------------------------------------- */
/*                               DB DEBUG WRITER                              */
/* -------------------------------------------------------------------------- */

export async function writeGithubDebugEvent(payload: any) {
  try {
    if (gw === 0) {
      await logit(
        "github",
        {
          level: "warn",
          message: "GitHub webhook disabled, not writing debug event",
          payload: { gw: String(gw) },
        },
        ctx
      );
      return;
    }

    await db.githubDebug.create({
      data: {
        raw: payload.raw ?? payload,
        ci: payload.ci ?? null,
        status: payload.status ?? null,
        action: payload.action ?? null,
        commit: payload.commit ?? null,
        sha: payload.sha ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write GithubDebug event:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*                         WORKFLOW_RUN TRANSFORMER                           */
/* -------------------------------------------------------------------------- */

function transformWorkflowRun(payload: any) {
  const wr = payload.workflow_run;
  if (!wr) return null;

  return {
    id: wr.id,
    name: wr.name,
    repo: payload.repository?.full_name ?? null,
    status: wr.status ?? null,
    conclusion: wr.conclusion ?? null,
    event: payload.action ?? "workflow_run",
    actor: wr.actor?.login ?? payload.sender?.login ?? null,
    commitMessage:
      wr.display_title ??
      wr.head_commit?.message ??
      payload.head_commit?.message ??
      null,
    commitSha: wr.head_sha ?? null,
    url: wr.html_url ?? null,
    createdAt: wr.created_at,
    updatedAt: wr.updated_at,
    source: "github",
  };
}

/* -------------------------------------------------------------------------- */
/*                        NORMALIZE ALL GITHUB EVENTS                         */
/* -------------------------------------------------------------------------- */

function normalizeGitHubEvent(event: string | null, payload: any) {
  const repo = payload.repository?.full_name ?? null;
  const actor = payload.sender?.login ?? null;

  const commit = getCommitMessage(payload);
  const sha = getSha(payload);

  // ⭐ Single unified DB write
  writeGithubDebugEvent({
    raw: payload,
    event,
    repo,
    actor,
    status: payload.workflow_run?.status ?? payload.status ?? null,
    action: payload.action ?? null,
    commit,
    sha,
    ci: payload.workflow_run?.name ?? null,
  });

  switch (event) {
    case "push":
      return {
        type: "push",
        repo,
        actor,
        sha: payload.after,
        branch: payload.ref?.replace("refs/heads/", ""),
        commitMessage: payload.head_commit?.message ?? null,
        url: payload.head_commit?.url ?? null,
      };

    case "pull_request":
      return {
        type: "pull_request",
        repo,
        actor,
        action: payload.action,
        number: payload.number,
        title: payload.pull_request?.title,
        url: payload.pull_request?.html_url,
        sha: payload.pull_request?.head?.sha,
        branch: payload.pull_request?.head?.ref,
      };

    case "workflow_run":
      return transformWorkflowRun(payload);

    case "deployment_status":
      return {
        type: "deployment_status",
        repo,
        actor,
        environment: payload.deployment?.environment,
        status: payload.deployment_status?.state,
        url: payload.deployment_status?.target_url,
        sha: payload.deployment?.sha,
      };

    case "issue_comment":
      return {
        type: "issue_comment",
        repo,
        actor,
        action: payload.action,
        issueNumber: payload.issue?.number,
        comment: payload.comment?.body,
        url: payload.comment?.html_url,
      };

    default:
      return { type: event, repo, actor };
  }
}

/* -------------------------------------------------------------------------- */
/*                         SIGNATURE VERIFICATION                             */
/* -------------------------------------------------------------------------- */

async function verifySignature(req: Request, body: string) {
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(body).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                                POST HANDLER                                */
/* -------------------------------------------------------------------------- */

export const POST = withLogging(async (req: Request) => {
  const raw = await req.text();

  if (!(await verifySignature(req, raw))) {
    await logit(
      "github",
      {
        level: "warn",
        message: "Invalid GitHub signature",
      },
      ctx
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");

  await logit(
    "github",
    {
      level: "info",
      message: "GitHub webhook received",
      payload: { event },
    },
    ctx
  );

  const normalized = normalizeGitHubEvent(event, payload);

  if (event === "workflow_run") {
    const wr = transformWorkflowRun(payload);

    if (!wr) {
      await logit(
        "github",
        {
          level: "warn",
          message: "workflow_run missing payload",
          payload: { event },
        },
        ctx
      );
      return new Response("OK");
    }

    await axiom.ingest("github-events", wr);

    await logit(
      "github",
      {
        level: "info",
        message: "GitHub workflow_run ingested",
        payload: { id: wr.id },
      },
      ctx
    );

    return new Response("OK");
  }

  await logit(
    "github",
    {
      level: "info",
      message: "GitHub event ignored",
      payload: { event },
    },
    ctx
  );

  return new Response("Ignored", { status: 200 });
});

/* -------------------------------------------------------------------------- */
/*                                GET HANDLER                                 */
/* -------------------------------------------------------------------------- */
