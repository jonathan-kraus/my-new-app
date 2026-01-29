"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildTestEmail } from "@/lib/buildTestEmail";
import { logit } from "@/lib/log/logit";

export async function sendTestEmail(to: string) {
	// --- 1. Read flag ---------------------------------------------------------
	const enabled = await getConfig("flag_email_send", "1");

	await logit(
		"email",
		{
			level: "info",
			message: "Checked flag_email_send",
		},
		{
			payload: {
				enabled_raw: enabled,
				enabled_string: String(enabled),
			},
		},
	);

	if (String(enabled) !== "1") {
		await logit("email", {
			level: "warn",
			message: "Email sending disabled by runtime flag",
		});
		return { ok: false, reason: "disabled" };
	}
	const throttleMinutes = Number(await getConfig("email.throttle.minutes", "0"));
	const lastSentRaw = await getConfig("email.last_sent_at", "");

	// --- 2. Build email -------------------------------------------------------
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

	// --- 3. Throttle ----------------------------------------------------------

	await logit(
		"email",
		{
			level: "info",
			message: "Throttle check starting",
		},
		{
			payload: {
				throttleMinutes,
				lastSentRaw,
			},
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
			{
				payload: {
					diffMinutes,
					throttleMinutes,
				},
			},
		);

		if (diffMinutes < throttleMinutes) {
			await logit(
				"email",
				{
					level: "warn",
					message: "Email throttled",
				},
				{
					payload: {
						diffMinutes,
						throttleMinutes,
						nextAllowedInMinutes: throttleMinutes - diffMinutes,
					},
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
			{
				payload: {
					to,
					subject: testEmail.subject,
				},
			},
		);
    	await logit(
		"email",
		{
			level: "info",
			message: "Updated last_sent_at",
      });
    	// --- 5. Update timestamp --------------------------------------------------
	const newTimestamp = new Date().toISOString();
	const saved = await setConfig("email.last_sent_at", newTimestamp);
  await logit(
    "email",
    {
      level: "info",
      message: "Updated last_sent_at",
    },
		{
			payload: {
				attempted: newTimestamp,
				saved,
				match: String(saved) === newTimestamp,
			},
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
			{
				payload: {
					error: err?.message,
					stack: err?.stack,
				},
			},
		);

    return { ok: false, reason: "error", detail: err.message };
	}
}
