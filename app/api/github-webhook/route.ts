export const runtime = "nodejs";

import { NextRequest } from "next/server";
import crypto from "crypto";
import { logit } from "@/lib/log/server";
import { log } from "next-axiom";

async function verifySignature(req: NextRequest, body: string) {
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

export async function POST(req: NextRequest) {
  const raw = await req.text();

  // 1. Verify signature
  if (!(await verifySignature(req, raw))) {
    await logit({
      level: "warn",
      message: "Invalid GitHub signature",
      file: "github-webhook",
    });
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(raw);
  const event = req.headers.get("x-github-event");

  // 2. Log the raw event type
  await logit({
    level: "info",
    message: "GitHub webhook received",
    data: { event },
  });

  switch (event) {
    case "workflow_run": {
      const wr = payload.workflow_run;

      // 3. Local log of filtered data
      await logit({
        level: "info",
        message: "workflow_run processed",
        data: {
          id: wr.id,
          name: wr.name,
          status: wr.status,
          conclusion: wr.conclusion,
          createdAt: wr.created_at,
          updatedAt: wr.updated_at,
          repo: payload.repository.full_name,
        },
      });

      // 4. Send filtered data to Axiom
      await log.ingest("github_events", {
        id: wr.id,
        name: wr.name,
        status: wr.status,
        conclusion: wr.conclusion,
        createdAt: wr.created_at,
        updatedAt: wr.updated_at,
        repo: payload.repository.full_name,
      });

      return new Response("OK");
    }

    default:
      // Log ignored events for visibility
      await logit({
        level: "info",
        message: "GitHub event ignored",
        data: { event },
      });
      return new Response("Ignored", { status: 200 });
  }
}
