// app/api/email/test/route.ts
import { sendTestEmail } from "@/app/forecast/mailersend";

export async function GET(req: Request) {
	const to = "jonathan.c.kraus@gmail.com";

	if (!to) {
		return new Response("Missing ?to=", { status: 400 });
	}

	await sendTestEmail(to);

	return new Response(`Test email sent to ${to}`);
}
