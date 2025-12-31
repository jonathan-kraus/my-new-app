import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await db.log.findMany({
    orderBy: { createdAt: "desc" },
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
            {logs.map((log) => {
              // Force UTC interpretation to avoid double timezone shift
              const utc = new Date(log.createdAt + "Z");

              return (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  {/* TIME COLUMN */}
                  <td className="p-4">
                    <div className="flex flex-col leading-tight">
                      {/* Local EST time */}
                      <span className="font-semibold text-gray-900">
                        {utc.toLocaleString("en-US", {
                          timeZone: "America/New_York",
                        })}
                      </span>

                      {/* Relative time */}
                      <span className="text-xs text-gray-500 italic">
                        {formatDistanceToNow(utc, { addSuffix: true })}
                      </span>
                    </div>
                  </td>

                  {/* LEVEL */}
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

                  {/* MESSAGE */}
                  <td className="p-4 font-mono text-sm">{log.message}</td>

                  {/* USER */}
                  <td className="p-4">{log.userId}</td>

                  {/* PAGE */}
                  <td className="p-4 font-mono text-xs">{log.page}</td>

                  {/* IP */}
                  <td className="p-4 font-mono text-xs">{log.ipAddress}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
