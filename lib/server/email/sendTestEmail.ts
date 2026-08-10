"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildTestEmail } from "@/lib/buildTestEmail";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { getThrottleStatus } from "./throttle-utils";

const built = staticUniversalContext("Jonathan");
let jei = 0;
const message_begin = "SendTestEmail -- ";

export async function sendTestEmail(message: string, subject: string) {
  // --- 1. Read flag -----------
  const enabled = await getConfig("email_enabled", "1");
  let jei = 1;
  if (String(enabled) !== "1") {
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Email disabled by flag",
      file: "lib/server/email/sendTestEmail.ts",
      line: 18,
      payload: { some: "data" },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
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

  await logj({
    domain: "jonathan",
    level: "info",
    message: message_begin + "Throttle check starting",
    file: "lib/server/email/sendTestEmail.ts",
    line: 60,
    payload: { some: "data" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const throttleStatus = getThrottleStatus(
    typeof lastSentRaw === "string" && lastSentRaw.length > 0
      ? lastSentRaw
      : null,
    throttleMinutes,
  );

  await logj({
    domain: "jonathan",
    level: "info",
    message: message_begin + "Throttle status computed",
    file: "lib/server/email/sendTestEmail.ts",
    line: 72,
    payload: {
      isThrottled: throttleStatus.isThrottled,
      canSendNow: throttleStatus.canSendNow,
      timeUntilAllowed: throttleStatus.timeUntilAllowed,
      remainingMinutes: throttleStatus.remainingMinutes,
      throttleWindowMinutes: throttleStatus.throttleWindowMinutes,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  if (throttleStatus.isThrottled) {
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Throttled",
      file: "lib/server/email/sendTestEmail.ts",
      line: 89,
      payload: { throttleStatus },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return {
      ok: false,
      reason: "throttled",
      detail: throttleStatus.timeUntilAllowed,
    };
  }

  // --- 4. Send email --------------------------------------------------------
  try {
    await mailerSend.email.send(emailParams);

    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Test email sent",
      file: "lib/server/email/sendTestEmail.ts",
      line: 111,
      payload: { some: "data" },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    // --- 5. Update timestamp --------------------------------------------------
    const newTimestamp = new Date().toISOString();
    const saved = await setConfig("email.last_sent_at", newTimestamp);
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Updated last_sent_at",
      file: "lib/server/email/sendTestEmail.ts",
      line: 124,
      payload: { some: "data" },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return { ok: true, sent: true };
  } catch (err: any) {
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Mailersend error",
      file: "lib/server/email/sendTestEmail.ts",
      line: 136,
      payload: { some: "data" },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return { ok: false, reason: "error", detail: err.message };
  }
}
