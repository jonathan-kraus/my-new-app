// app/forecast/mailersend.ts
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { getRuntimeBoolean } from "@/lib/runtimeConfig";
import { buildTestEmail } from "@/lib/buildTestEmail";

export async function sendTestEmail(to: string) {
  const enabled = await getRuntimeBoolean("email.weather.enabled", true);

  if (!enabled) {
    console.log("[email.weather.enabled=0] Skipping test email");
    return;
  }

  const testEmail = buildTestEmail();

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("weather@yourdomain.com", "Weather Bot");
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(testEmail.subject)
    .setHtml(testEmail.html)
    .setText(testEmail.text);

  await mailerSend.email.send(emailParams);

  console.log(`Test email sent to ${to}`);
}
