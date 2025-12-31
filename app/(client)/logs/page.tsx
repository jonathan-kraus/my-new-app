// app/(client)/logs/page.tsx - CORRECT ORDERBY
import { db } from "@/lib/db";
import { Log } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
	const logs = await db.log.findMany({
		orderBy: {
			createdAt: "desc" as const, // ✅ Prisma scalar sort
		},
		take: 50,
	});

	return (
		<div>
			<h1 className="text-4xl font-bold mb-8">Recent Logs</h1>
			<div className="overflow-x-auto">
				<table className="w-full bg-white rounded-2xl shadow-xl">
					<thead>
						<tr className="bg-gradient-to-r from-gray-50 to-gray-100">
							<th className="p-4 text-left">Time</th>
							<th className="p-4 text-left">Level</th>
							<th className="p-4 text-left">Message</th>
							<th className="p-4 text-left">User</th>
							<th className="p-4 text-left">Page</th>
							<th className="p-4 text-left">IP</th>
						</tr>
					</thead>
					<tbody>
						{logs.map((log) => (
							<tr key={log.id} className="border-t hover:bg-gray-50">
								<td className="p-4">{new Date(log.createdAt).toLocaleString()}</td>
								<td
									className={`p-4 font-bold ${
										log.level === "error"
											? "text-red-600"
											: log.level === "warn"
												? "text-yellow-600"
												: "text-green-600"
									}`}
								>
									{log.level.toUpperCase()}
								</td>
								<td className="p-4 font-mono text-sm">{log.message}</td>
								<td className="p-4">{log.userId}</td>
								<td className="p-4 font-mono text-xs">{log.page}</td>
								<td className="p-4 font-mono text-xs">{log.ipAddress}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
