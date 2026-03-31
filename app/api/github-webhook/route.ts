// app/api/github-webhook/route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { Axiom } from "@axiomhq/js";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/build-universal-context";
import { withLogging } from "@/lib/logging/withLogging";
import { getConfig } from "@/lib/runtime/config";
import { getSha } from "@/lib/github/parse";
import { getCommitMessage } from "@/lib/github";
import { db } from "@/lib/db";
import { z } from "zod";

const gw = Number(await getConfig("github_webhook", "0"));
const axiom = new Axiom({ token: process.env.AXIOM_TOKEN! });

/* -------------------------------------------------------------------------- */
/*                               ZOD SCHEMA                                   */
/* -------------------------------------------------------------------------- */

// Validates the *body* payload only — headers are read separately
export const GitHubWebhookBodySchema = z
  .object({
    action: z.string().optional(),

    repository: z
      .object({
        name: z.string().optional(),
        full_name: z.string().optional(),
        id: z.number().optional(),
        private: z.boolean().optional(),
        owner: z
          .object({
            login: z.string().optional(),
            id: z.number().optional(),
            type: z.string().optional(),
          })
          .optional(),
      })
      .optional(),

    sender: z
      .object({
        login: z.string().optional(),
        id: z.number().optional(),
        type: z.string().optional(),
      })
      .optional(),

    installation: z
      .object({
        id: z.number().optional(),
      })
      .optional(),
  })
  // Allow any extra fields GitHub may send for event types you don't explicitly model
  .passthrough();

// Validates the full parsed webhook including headers
export const GitHubWebhookSchema = z.object({
  event: z.string(),
  delivery: z.string(),
  body: GitHubWebhookBodySchema,
});

export type GitHubWebhook = z.infer<typeof GitHubWebhookSchema>;

/* -------------------------------------------------------------------------- */
/*                                POST HANDLER                                */
/* -------------------------------------------------------------------------- */

export const POST = withLogging(async (req: Request) => {
  const built = staticUniversalContext("GITHUB");

  const raw = await req.text();
  if (!(await verifySignature(req, raw))) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Read headers first — these come from HTTP, not the JSON body
  const event = req.headers.get("x-github-event");
  const deliveryId = req.headers.get("x-github-delivery");

  const payload = JSON.parse(raw);

  // Validate by composing headers + body together
  const parsed = GitHubWebhookSchema.safeParse({
    event,
    delivery: deliveryId,
    body: payload,
  });

  if (!parsed.success) {
    console.error("Invalid GitHub webhook", parsed.error.format());
    // Optionally return early if you want strict validation:
    // return new Response("Bad Request", { status: 400 });
  }

  const commitMessage = await getCommitMessage(payload);
  const sha = getSha(payload);
  const normalized = {
    eventId: deliveryId!,
    type: event ?? "unknown",
    repo: payload.repository?.full_name ?? "unknown",
    actor: payload.sender?.login ?? null,
    status: payload.workflow_run?.status ?? payload.status ?? null,
    conclusion: payload.workflow_run?.conclusion ?? null,
    commitSha: sha ?? null,
    commitMessage: commitMessage ?? null,
    url: payload.workflow_run?.html_url ?? null,
    raw: payload,
  };

  await logj({
    domain: "jonathan",
    level: "info",
    message: "Github webhook processed " + event,
    file: "app/api/github-webhook/route.ts",
    line: 115,
    payload: { event: event, type: normalized.type, gw: gw },
    meta: {
      built,
    },
  });
  await db.githubEvent.upsert({
    where: { eventId: normalized.eventId },
    update: normalized,
    create: normalized,
  });

  return new Response("OK");
});

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
