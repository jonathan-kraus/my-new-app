// app/forecast/mailersend.ts
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

import { buildTestEmail } from "@/lib/buildTestEmail";

export async function sendTestEmail(to: string) {
  const testEmail = buildTestEmail();

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("weather@www.kraus.my.id", "Weather Bot");
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(testEmail.subject)
    .setHtml(testEmail.html)
    .setText(testEmail.text);

  await mailerSend.email.send(emailParams);
  console.log(
    "mailersend module loaded, sendTestEmail is defined:",
    typeof sendTestEmail,
  );
  console.log(`Test email sent to ${to}`);
}
