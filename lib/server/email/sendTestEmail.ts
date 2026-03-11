"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildTestEmail } from "@/lib/buildTestEmail";
import { logit } from "@/lib/log/logit";

const eventIndex = 22;
const requestId = crypto.randomUUID();
export async function sendTestEmail(message: string, subject: string) {
  // --- 1. Read flag ---------------------------------------------------------
  const enabled = await getConfig("email_enabled", "1");

  await logit(
    "email",
    {
      level: "info",
      message: "Checked email_enabled message: " + message,
    },
    { eventIndex },
    {
      payload: {
        enabled_raw: enabled,
        enabled_string: String(enabled),
        message,
        subject,
      },
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  if (String(enabled) !== "1") {
    await logit(
      "email",
      {
        level: "warn",
        message: "Email sending disabled by runtime flag",
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
    return { ok: false, reason: "disabled" };
  }
  const throttleMinutes = Number(
    await getConfig("email.throttle.minutes", "0"),
  );
  const lastSentRaw = await getConfig("email.last_sent_at", "");

  // --- 2. Build email -------------------------------------------------------
  const baseEmail = buildTestEmail();

  const finalSubject = subject ?? baseEmail.subject;

  const finalText = message ?? baseEmail.text;

  const finalHtml = message
    ? `<pre style="font-family: system-ui">${message}</pre>`
    : baseEmail.html;

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("jonathan@www.kraus.my.id", "Weather Bot");
  const recipients = [new Recipient("jonathankraus2026@outlook.com")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(finalSubject)
    .setHtml(finalHtml)
    .setText(finalText);

  // --- 3. Throttle ----------------------------------------------------------

  await logit(
    "email",
    {
      level: "info",
      message: "Throttle check starting",
    },
    { eventIndex },
    {
      payload: {
        throttleMinutes,
        lastSentRaw,
      },
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  if (typeof lastSentRaw === "string" && lastSentRaw.length > 0) {
    const last = new Date(lastSentRaw);
    const now = new Date();
    const diffMinutes = (now.getTime() - last.getTime()) / 1000 / 60;

    await logit(
      "email",
      {
        level: "info",
        message: "Computed throttle difference",
      },
      { eventIndex },
      {
        payload: {
          diffMinutes,
          throttleMinutes,
        },
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    if (diffMinutes < throttleMinutes) {
      await logit(
        "email",
        {
          level: "warn",
          message: "Email throttled",
        },
        { eventIndex },
        {
          diffMinutes,
          throttleMinutes,
          nextAllowedInMinutes: throttleMinutes - diffMinutes,

          requestId: requestId,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
        },
      );
      return {
        ok: false,
        reason: "throttled",
        detail: `Wait ${Math.ceil(throttleMinutes - diffMinutes)} more minutes`,
      };
    }
  }

  // --- 4. Send email --------------------------------------------------------
  try {
    await mailerSend.email.send(emailParams);

    await logit(
      "email",
      {
        level: "info",
        message: "Test email sent",
      },
      { eventIndex },
      {
        payload: {
          subject: finalSubject,
          message_preview: message?.slice(0, 80),
        },
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
    await logit(
      "email",
      {
        level: "info",
        message: "Updated last_sent_at",
      },
      { eventIndex },
      {
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );
    // --- 5. Update timestamp --------------------------------------------------
    const newTimestamp = new Date().toISOString();
    const saved = await setConfig("email.last_sent_at", newTimestamp);
    await logit(
      "email",
      {
        level: "info",
        message: "Updated last_sent_at",
      },
      { eventIndex },
      {
        payload: {
          attempted: newTimestamp,
          saved,
          match: String(saved) === newTimestamp,
        },
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    return { ok: true, sent: true };
  } catch (err: any) {
    await logit(
      "email",
      {
        level: "error",
        message: "MailerSend error",
      },
      { eventIndex },
      {
        payload: {
          error: err?.message,
          stack: err?.stack,
        },
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        }),
      },
    );

    return { ok: false, reason: "error", detail: err.message };
  }
}
