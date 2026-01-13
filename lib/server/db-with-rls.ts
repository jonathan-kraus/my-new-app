// lib/server/db-with-rls.ts

import { neon } from "@neondatabase/serverless";

export function getDbWithRls(email: string) {
	const sql = neon(process.env.DATABASE_URL!, {
		fetchOptions: {
			headers: {
				"app.current_user_email": email,
			},
		},
	});

	return (strings: TemplateStringsArray, ...values: any[]) => {
		return sql(strings, ...values);
	};
}
