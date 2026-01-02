// lib/logger.ts - TYPES ONLY (no DB!)
export interface LogMessage {
	level: "info" | "warn" | "error" | "debug";
	message: string;
	data?: Record<string, any>;
	userId?: string;
	page?: string;
}
function getCallsite() {
	const stack = new Error().stack;
	if (!stack) return {};

	const lines = stack.split("\n");
	const caller = lines.find((l) => l.includes(".ts") || l.includes(".tsx"));

	if (!caller) return {};

	const match = caller.match(/\((.*):(\d+):(\d+)\)/);
	if (!match) return {};

	return {
		file: match[1],
		line: Number(match[2]),
	};
}

// ✅ Universal - works Client/Server/Mars
export async function appLog(msg: Omit<LogMessage, "createdAt">): Promise<{ success: boolean }> {
	const callsite = getCallsite();
	const payload = {
		...msg,
		...callsite,
		createdAt: new Date().toISOString(),
	};

	try {
		const response = await fetch("/api/log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const result = await response.json();
		console.log(`[LOG-${result.success ? "OK" : "FAIL"}] ${msg.message}`);
		return result;
	} catch (error) {
		console.error("[LOG-ERROR]", error);
		return { success: false };
	}
}
