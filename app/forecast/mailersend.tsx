import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

import { buildWeatherEmail } from "./buildWeatherEmail";
export async function sendWeatherEmail({
  to,
  weatherEmail,
}: {
  to: string;
  weatherEmail: ReturnType<typeof buildWeatherEmail>;
}) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("weather@www.kraus.my.id", "Weather Bot");
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(weatherEmail.subject)
    .setHtml(weatherEmail.html)
    .setText(weatherEmail.text);

  await mailerSend.email.send(emailParams);
}
