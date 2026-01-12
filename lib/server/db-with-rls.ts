// lib/server/db-with-rls.ts
import { neon } from "@neondatabase/serverless";
import { logit } from "../log/server";

export function getDbWithRls(email: string) {
	logit({
		level: "info",
		message: "In getDbWithRls",
		file: "lib/server/db-with-rls.ts",
		page: "Notes app",
		data: { email },
	});
	return neon(process.env.DATABASE_URL!, {
		fetchOptions: {
			headers: {
				"app.current_user_email": email, // RLS header
			},
		},
	});
}
