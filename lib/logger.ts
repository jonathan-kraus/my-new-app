import { headers } from "next/headers";

// lib/logger.ts - TYPES ONLY (no DB!)
export interface LogMessage {
	level: "info" | "warn" | "error" | "debug";
	message: string;
	data?: Record<string, any>;
	userId?: string;
	page?: string;
}
let requestId: string | undefined;

function getCallsite() {
  const stack = new Error().stack;
  if (!stack) return {};

  const lines = stack.split("\n");

  for (const line of lines) {
    // Skip logger internals
    if (
      line.includes("appLog") ||
      line.includes("getCallsite") ||
      line.includes("node_modules")
    ) {
      continue;
    }


    // Match both client & server formats
    const match =
      line.match(/\(?(.+?):(\d+):(\d+)\)?$/) ||
      line.match(/at .* \((.+?):(\d+):(\d+)\)/);

    if (match) {
      return {
        file: match[1],
        line: Number(match[2]),
      };
    }
  }

  return {};
}
console.log(new Error().stack);

// ✅ Universal - works Client/Server/Mars
export async function appLog(msg: Omit<LogMessage, "createdAt">): Promise<{ success: boolean }> {
	const callsite = getCallsite();
	const payload = {
		...msg,
		...callsite,
    requestId,
		createdAt: new Date().toISOString(),
	};
const baseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://www.kraus.my.id"
    : "";

await fetch(`${baseUrl}/api/log`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

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
