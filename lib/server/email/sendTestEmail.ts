"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildTestEmail } from "@/lib/buildTestEmail";

export async function sendTestEmail(to: string) {
// 1. Check if email sending is enabled

const enabled = await getConfig("flag_email_send", "1");
console.log("[email] flag_email_send value:", enabled, "as string:", String(enabled));

console.log("[email] flag_email_send value:", enabled);
if (String(enabled) !== "1") {

  console.log("[email] Disabled by runtime flag");
  return; }

  const testEmail = buildTestEmail();

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("jonathan@www.kraus.my.id", "Weather Bot");
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(testEmail.subject)
    .setHtml(testEmail.html)
    .setText(testEmail.text);
// 2. Get throttle minutes
const throttleMinutes = Number(await getConfig("email.throttle.minutes", "0"));
// 3. Get last sent timestamp
const lastSentRaw = await getConfig("email.last_sent_at", "");

if (typeof lastSentRaw === "string" && lastSentRaw.length > 0) {
  const last = new Date(lastSentRaw);
  const now = new Date();
  const diffMinutes = (now.getTime() - last.getTime()) / 1000 / 60;

  if (diffMinutes < throttleMinutes) {
    console.log(`[email] Throttled. Last sent ${diffMinutes.toFixed(1)} minutes ago.`);
    return;
  }
}


  await mailerSend.email.send(emailParams);
  console.log(
    "mailersend module loaded, sendTestEmail is defined:",
    typeof sendTestEmail,
  );
  console.log(`Test email sent to ${to}`);
    await setConfig("email.last_sent_at", new Date().toISOString());
console.log("[email] Sent and timestamp updated");

}
