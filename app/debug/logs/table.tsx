// app/debug/logs/table.tsx
import LogRow from "./row";

async function fetchLogs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/logs?limit=50`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  return res.json();
}

export default async function LogsTable() {
  const logs = await fetchLogs();

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Domain</th>
            <th className="p-2 text-left">Message</th>
            <th className="p-2 text-left">Expand</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any) => (
            <LogRow key={log.id} log={log} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
