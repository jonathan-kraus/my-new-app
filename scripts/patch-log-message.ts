#!/usr/bin/env tsx
import "dotenv/config";
import { db } from "../lib/db";

const idArg = Number(process.argv[2]);
const id = Number.isFinite(idArg) ? idArg : 15643;

async function main() {
	console.log("Patching log id", id);

	const log = await db.log.findUnique({ where: { id } });
	if (!log) {
		console.log("No log found with id", id);
		process.exit(1);
	}

	const currentMessage = log.message ?? "";
	if (!/^#\d+\s*$/.test(currentMessage)) {
		console.log(
			"Log message is not just a counter; skipping. Current message:",
			JSON.stringify(currentMessage),
		);
		process.exit(0);
	}

	const payload = (log.payload ?? {}) as any;
	const eventIndexMatch = currentMessage.match(/^#(\d+)/);
	const eventIndex = eventIndexMatch ? Number(eventIndexMatch[1]) : undefined;

	const parts: string[] = [];
	if (payload.method) parts.push(payload.method);
	if (payload.path) parts.push(payload.path);
	if (payload.status !== undefined) parts.push(`status=${payload.status}`);
	if (payload.duration !== undefined) parts.push(`duration=${payload.duration}ms`);

	const newBody = parts.join(" ");
	const newMessage =
		eventIndex !== undefined && newBody
			? `#${eventIndex} ${newBody}`
			: `#${eventIndex ?? log.id} ${newBody}`;

	const updated = await db.log.update({ where: { id }, data: { message: newMessage } });
	console.log("Updated log", updated.id, "message ->", updated.message);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
