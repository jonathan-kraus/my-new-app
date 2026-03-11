"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildSendWeatherEmail } from "@/lib/buildSendWeatherEmail";
import { logit } from "@/lib/log/logit";

export async function sendWeatherEmail(message?: string, subject?: string) {
  // --- 1. Read flag ---------------------------------------------------------
  const enabled = await getConfig("email_enabled", "1");
  const eventIndex = 22;
  const requestId = crypto.randomUUID();
  await logit(
    "email",
    {
      level: "info",
      message: "sendWeatherEmail - Checked email_enabled",
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
        message: "sendWeatherEmail - Email sending disabled by runtime flag",
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
  const baseEmail = await buildSendWeatherEmail();

  const finalSubject = subject || baseEmail.subject;
  const finalText = message || baseEmail.text;

  // Always include your template, optionally append message
  const finalHtml =
    baseEmail.html +
    (message
      ? `<div style="margin-top:20px; font-family: system-ui;">
           <pre>${message}</pre>
         </div>`
      : "");

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("jonathan@www.kraus.my.id", "Travel Weather Bot");
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
        message: "Travel Weather email sent",
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
