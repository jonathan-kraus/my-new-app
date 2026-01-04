import { db } from "@/lib/db";
import LogTable from "./LogTable";
export const dynamic = "force-dynamic";

export default async function LogsPage() {
	const logs = await db.log.findMany({
		orderBy: { createdAt: "desc" },
		take: 50,
	});
	return <LogTable logs={logs} />;
}
