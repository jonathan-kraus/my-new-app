// app/api/github-webhook/route.ts
import { NextRequest } from "next/server";
import { logit } from "@/lib/log/server";
import { getCommitMessage, getSha } from "@/lib/github";
import crypto from "crypto";
import { log } from "next-axiom/dist/logger";

async function verifySignature(
  req: NextRequest,
  body: string,
): Promise<boolean> {
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(body).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Get raw body for signature verification
  const body = await req.text();

  // Verify GitHub signature
  const isValid = await verifySignature(req, body);
  if (!isValid) {
    await logit({
      level: "warn",
      message: "Invalid Signature on GitHub Webhook",
      file: "app/api/github-webhook/route.ts",
      line: 35,
      page: "GitHub Webhook Handler",
    });
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const je = req.headers.get("x-github-event");
  const sha = getSha(payload);
  const commitMessage = getCommitMessage(payload);
  await log.info("GitHub Webhook Received", {
  body: JSON.stringify(body),   // ⭐ full raw payload
  je: body?.action || body?.je, // event type
  sha: body?.workflow_run?.head_sha || body?.after,
  page: "GitHub Webhook Handler"
});

  await logit({
    level: "info",
    message: "Verifying Signature on GitHub Webhook -- all data logged",
    file: "app/api/github-webhook/route.ts",
    line: 49,
    page: "GitHub Webhook Handler",
    data: {
      body,
      sha,
      je,
      commitMessage,
    },
  });
  switch (je) {
    case "check_run":
      {
        const run = payload.check_run;
        await logit({
          level: "info",
          message: "✅ check.run 🏃",
          file: "app/api/github-webhook/route.ts",
          line: 65,
          data: {
            id: run.id,
            name: run.name,
            status: run.status,
            conclusion: run.conclusion,
            startedAt: run.started_at,
            completedAt: run.completed_at,
            headSha: run.head_sha?.substring(0, 7),
            externalId: run.external_id,
            app: run.app?.name,
          },
        });
      }
      break;
    case "check_suite":
      {
        const suite = payload.check_suite;
        await logit({
          level: "info",
          message: `${je}  check.suite executed`,
          file: "app/api/github-webhook/route.ts",
          line: 87,
          page: "GitHub Webhook Handler",
          data: {
            id: suite.id,
            status: suite.status,
            conclusion: suite.conclusion,
            headBranch: suite.head_branch,
            headSha: suite.head_sha?.substring(0, 7),
            app: suite.app?.name,
          },
        });
      }
      break;
    case "deployment":
      {
        const deployment = payload.deployment;
        await logit({
          level: "info",
          message: `${je}  deployment.created`,
          file: "app/api/github-webhook/route.ts",
          line: 107,
          page: "GitHub Webhook Handler",
          data: {
            environment: deployment.environment,
            sha: deployment.sha?.substring(0, 7),
            ref: deployment.ref,
            task: deployment.task,
            creator: deployment.creator?.login,
            description: deployment.description,
          },
        });
      }
      break;
    case "deployment_status":
      {
        const deploymentStatus = payload.deployment_status;
        const deployment = payload.deployment;
        await logit({
          level: "info",
          message: `${je}  deployment.status.updated`,
          file: "app/api/github-webhook/route.ts",
          line: 128,
          page: "GitHub Webhook Handler",
          data: {
            state: deploymentStatus.state,
            environment: deployment.environment,
            sha: deployment.sha?.substring(0, 7),
            commitMessage:
              deployment.payload?.commit_message ||
              deployment.description ||
              payload.commits?.[0]?.message,
            deploymentUrl: deploymentStatus.target_url,
            creator: deployment.creator?.login,
            pusher: deployment.payload?.pusher?.name || payload.sender?.login,
          },
        });
      }
      break;
    case "issue_comment":
      {
        const comment = payload.comment;
        const issue = payload.issue;
        await logit({
          level: "info",
          message: `${je}  issue comment`,
          file: "app/api/github-webhook/route.ts",
          line: 153,
          page: "GitHub Webhook Handler",
          data: {
            event: je,
            commenter: comment.user?.login,
            comment_body: comment.body,
            comment_ID: comment.id,
            issue_ID: issue.id,
            issue_url: issue.url,
            state: issue.state,
            title: issue.title,
          },
        });
      }
      break;
    case "issues":
      {
        const issue = payload.issue;
        await logit({
          level: "info",
          message: `${je}  issues`,
          file: "app/api/github-webhook/route.ts",
          line: 175,
          page: "GitHub Webhook Handler",
          data: {
            event: je,
            action: payload.action,
            issue_ID: issue.id,
            issue_url: issue.url,
            state: issue.state,
            title: issue.title,
          },
          // action: payload.action,
          // issue: issue.number,
          // title: issue.title,
          // state: issue.state,
        });
      }
      break;
    case "pull_request":
      {
        const pr = payload.pull_request;
        const isRenovate = pr.user?.login === "renovate[bot]";

        if (isRenovate) {
          const branch = pr.head.ref;
          const title = pr.title;
          const packageGroup = branch.replace("renovate/", "");
          const severity = title.includes("major") ? "warning" : "info";

          if (payload.action === "opened") {
            await logit({
              level: "info",
              message: `${je}  dependency.update.opened`,
              file: "app/api/github-webhook/route.ts",
              line: 208,
              page: "GitHub Webhook Handler",
              data: {
                source: "renovate",
                packageGroup,
                branch,
                title,
                createdAt: pr.created_at,
                severity,
                prUrl: pr.html_url,
              },
            });
          } else if (payload.action === "closed" && pr.merged) {
            await logit({
              level: "info",
              message: `${je}  dependency.update.merged`,
              file: "app/api/github-webhook/route.ts",
              line: 225,
              page: "GitHub Webhook Handler",
              data: {
                source: "renovate",
                packageGroup,
                branch,
                title,
                severity,
                prUrl: pr.html_url,
                mergedAt: pr.merged_at,
              },
            });
          } else if (payload.action === "synchronize") {
            await logit({
              level: "info",
              message: `${je}  dependency.update.synchronized`,
              file: "app/api/github-webhook/route.ts",
              line: 242,
              page: "GitHub Webhook Handler",
              data: {
                source: "renovate",
                packageGroup,
                branch,
                title,
                severity,
                prUrl: pr.html_url,
              },
            });
          }
        }
      }
      break;
    case "pull_request_review":
      {
        const review = payload.review;
        const pr = payload.pull_request;
        await logit({
          level: "info",
          message: `${je}  pull_request_review`,
          file: "app/api/github-webhook/route.ts",
          line: 269,
          page: "GitHub Webhook Handler",
          data: {
            event: je,
            action: payload.action,
            keys: Object.keys(payload),
            repository: payload.repository?.full_name,
            sender: payload.sender?.login,
            reviewer: review?.user?.login,
            review_state: review?.state,
            review_body: review?.body,
            review_id: review?.id,
            pr_number: pr?.number,
            pr_url: pr?.html_url,
            pr_author: pr?.user?.login,
            timestamp: new Date().toISOString(),
          },
        });
      }
      break;
    case "pull_request_review_comment":
      {
        const comment = payload.comment;
        const pr = payload.pull_request;
        await logit({
          level: "info",
          message: `${je}  pull_request_review_comment`,
          file: "app/api/github-webhook/route.ts",
          line: 293,
          page: "GitHub Webhook Handler",
          data: {
            event: je,
            action: payload.action,
            keys: Object.keys(payload),
            repository: payload.repository?.full_name,
            sender: payload.sender?.login,
            commenter: comment?.user?.login,
            comment_body: comment?.body,
            comment_id: comment?.id,
            path: comment?.path,
            position: comment?.position,
            pr_number: pr?.number,
            pr_url: pr?.html_url,
            timestamp: new Date().toISOString(),
          },
        });
      }
      break;
    case "push":
      {
        const commits = payload.commits || [];
        for (const commit of commits) {
          await logit({
            level: "info",
            message: `${je}  push.commit`,
            file: "app/api/github-webhook/route.ts",
            line: 321,
            page: "GitHub Webhook Handler",
            data: {
              sha: commit.id.substring(0, 7),
              message: commit.message,
              author: commit.author?.name,
              email: commit.author?.email,
              branch: payload.ref?.replace("refs/heads/", ""),
              pusher: payload.pusher?.name,
            },
          });
        }
      }
      break;
    case "repository":
      {
        const repository = payload.repository;
        await logit({
          level: "info",
          message: `${je}  repository.event`,
          file: "app/api/github-webhook/route.ts",
          line: 342,
          page: "GitHub Webhook Handler",
          data: {
            id: repository.id,
            name: repository.name,
            fullName: repository.full_name,
            description: repository.description,
            ownerLogin: repository.owner?.login,
          },
        });
      }
      break;
    case "status":
      await logit({
        level: "info",
        message: `${je}  commit.status`,
        file: "app/api/github-webhook/route.ts",
        line: 359,
        page: "GitHub Webhook Handler",
        data: {
          state: payload.state,
          context: payload.context,
          description: payload.description,
          sha: payload.sha?.substring(0, 7),
          targetUrl: payload.target_url,
          branches: payload.branches?.map((b: any) => b.name).join(", "),
        },
      });
      break;
    case "workflow_job":
      {
        const job = payload.workflow_job;
        await logit({
          level: "info",
          message: `${je}  workflow.job`,
          file: "app/api/github-webhook/route.ts",
          line: 378,
          page: "GitHub Webhook Handler",
          data: {
            jobName: job.name,
            action: payload.action,
            status: job.status,
            conclusion: job.conclusion,
            startedAt: job.started_at,
            completedAt: job.completed_at,
            runId: job.run_id,
            runUrl: job.html_url,
            runnerName: job.runner_name,
            labels: job.labels?.join(", "),
          },
        });
      }
      break;
    case "workflow_run":
      {
        const workflow = payload.workflow_run;
        await logit({
          level: "info",
          message: `${je}  workflow.run`,
          file: "app/api/github-webhook/route.ts",
          line: 402,
          page: "GitHub Webhook Handler",
          data: {
            workflowName: workflow.name,
            status: workflow.status,
            conclusion: workflow.conclusion,
            event: workflow.event,
            branch: workflow.head_branch,
            sha: workflow.head_sha?.substring(0, 7),
            actor: workflow.actor?.login,
            runUrl: workflow.html_url,
          },
        });
      }
      break;
    default:
      await logit({
        level: "warn",
        message: `${je}  webhook.unhandled`,
        file: "app/api/github-webhook/route.ts",
        line: 422,
        page: "GitHub Webhook Handler",
        data: {
          event: je,
          action: payload.action,
          keys: Object.keys(payload),
        },
      });
  }

  return new Response("OK", { status: 200 });
}
