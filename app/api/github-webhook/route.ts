export const runtime = "nodejs";

import crypto from "crypto";
import { Axiom } from "@axiomhq/js";
import { log } from "@/lib/log/logger";
import { setLogFile } from "@/lib/log/set-logfile";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { getSha } from "@/lib/github/parse";
import { getCommitMessage } from "@/lib/github";
import { db } from "@/lib/db";
import { z } from "zod";

const gw = Number(await getConfig("github_webhook", "0"));
const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });
export const GitHubWebhookSchema = z.object({
  repository: z.object({
    name: z.string(),
  }),
  action: z.string(),
  sender: z.object({
    login: z.string(),
  }),
});

  setLogFile("app/api/github-webhook/route.ts");
          log.action("github", "Starting Github webhook", {
            enabled: gw,
        });

/* -------------------------------------------------------------------------- */
/*                               DB EVENT WRITER                              */
/* -------------------------------------------------------------------------- */

async function writeGithubEvent(normalized: any) {
  await db.githubEvent.upsert({
    where: { eventId: normalized.eventId },
    update: normalized,
    create: normalized,
  });
}

/* -------------------------------------------------------------------------- */
/*                                MAIN ROUTE                                 */

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

function normalizeGitHubEvent(
  event: string | null,
  payload: any,
  deliveryId: string | null,
) {
  const repo = payload.repository?.full_name ?? null;
  const actor = payload.sender?.login ?? null;

  const commitMessage = getCommitMessage(payload) ?? null;
  const commitSha = getSha(payload) ?? null;

  let status = null;
  let conclusion = null;
  let url = null;

  switch (event) {
    case "workflow_run": {
      const wr = payload.workflow_run;
      status = wr?.status ?? null;
      conclusion = wr?.conclusion ?? null;
      url = wr?.html_url ?? null;
      break;
    }

    case "push": {
      url = payload.head_commit?.url ?? null;
      break;
    }

    case "pull_request": {
      url = payload.pull_request?.html_url ?? null;
      break;
    }

    case "deployment_status": {
      status = payload.deployment_status?.state ?? null;
      url = payload.deployment_status?.target_url ?? null;
      break;
    }

    case "issue_comment": {
      url = payload.comment?.html_url ?? null;
      break;
    }
  }

  return {
    eventId: deliveryId ?? payload.workflow_run?.id ?? crypto.randomUUID(),
    type: event,
    repo,
    actor,
    status,
    conclusion,
    commitSha,
    commitMessage,
    url,
    raw: payload,
  };
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
    return new Response("Unauthorized", { status: 401 });
  }
  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");
  const deliveryId = req.headers.get("x-github-delivery");
  const commitMessage = await getCommitMessage(payload); // FIX #1 const sha = getSha(payload);
  const sha = getSha(payload);
  const parsed = GitHubWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Invalid GitHub webhook", parsed.error.format());
  }
    log.action("github", "GitHub webhook received ---", {
    event: event,
  });

  const normalized = {
    eventId: deliveryId!,
    type: event ?? "unknown", // FIX #2
    repo: payload.repository?.full_name ?? "unknown",
    actor: payload.sender?.login ?? null,
    status: payload.workflow_run?.status ?? payload.status ?? null,
    conclusion: payload.workflow_run?.conclusion ?? null,
    commitSha: sha ?? null,
    commitMessage: commitMessage ?? null,
    url: payload.workflow_run?.html_url ?? null,
    raw: payload,
  };

  await db.githubEvent.upsert({
    where: { eventId: normalized.eventId },
    update: normalized,
    create: normalized,
  });
  return new Response("OK");
});
