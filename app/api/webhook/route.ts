import { NextResponse } from "next/server";
import { Resend } from "resend";
import { logj } from "@/lib/log/logj";
import type { LogjInput } from "@/lib/log/types";
import { staticUniversalContext } from "@/lib/log/buildj";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  const built = await staticUniversalContext("resend-webhook");
  let jei = 0;
  const log = (
    level: LogjInput["level"],
    message: string,
    payload: LogjInput["payload"] = {},
  ) =>
    logj({
      domain: "resend",
      level,
      message,
      file: "app/api/webhook/route.ts",
      payload,
      meta: { built: { ...built, eventIndex: ++jei } },
    });

  if (!webhookSecret || !apiKey) {
    await log("error", "Resend webhook configuration is incomplete", {
      webhookSecretPresent: Boolean(webhookSecret),
      apiKeyPresent: Boolean(apiKey),
    });
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 500 },
    );
  }
  if (!id || !timestamp || !signature) {
    await log("warn", "Resend webhook rejected: missing signature headers");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  let event;
  try {
    // Verify the original bytes before parsing or fetching anything from Resend.
    event = resend.webhooks.verify({
      payload: await request.text(),
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch {
    await log("warn", "Resend webhook rejected: invalid signature or payload");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event?.type !== "email.received") {
    await log("info", "Resend webhook event ignored", {
      eventType: event?.type ?? "unknown",
    });
    return NextResponse.json({ received: true, ignored: true });
  }
  const emailId = event.data?.email_id;
  if (typeof emailId !== "string" || !emailId) {
    await log("warn", "Resend received-email event is missing its email ID");
    return NextResponse.json({ error: "Invalid email event" }, { status: 400 });
  }

  try {
    const { data: email, error } = await resend.emails.receiving.get(emailId);
    if (error || !email) {
      await log("error", "Could not retrieve received Resend email", {
        emailId,
        errorName: error?.name ?? "missing_email",
      });
      return NextResponse.json(
        { error: "Email retrieval failed" },
        { status: 502 },
      );
    }
    await log("info", "Received email via Resend", {
      emailId,
      eventType: event.type,
      from: email.from,
      subject: email.subject.slice(0, 500),
      hasHtml: Boolean(email.html),
      hasText: Boolean(email.text),
      attachmentCount: email.attachments?.length ?? 0,
    });
    return NextResponse.json({ received: true });
  } catch {
    await log("error", "Resend received-email processing failed", { emailId });
    return NextResponse.json(
      { error: "Email processing failed" },
      { status: 500 },
    );
  }
}
