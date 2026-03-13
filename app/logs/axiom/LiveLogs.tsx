/*
 * @FilePath: \my-new-app\app\logs\axiom\liveLogs.tsx
 * @LastEditTime: 2026-03-12 21:46:38
 */
"use client";

import { useEffect, useState } from "react";

export default function LiveLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    const res = await fetch("/api/logs/live", { cache: "no-store" });
    const json = await res.json();
    setLogs(json.logs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 2000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading logs…</div>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log, i) => (
        <div
          key={i}
          className="p-4 rounded-lg bg-black/40 border border-white/10 text-sm"
        >
          <div className="flex justify-between">
            <span className="font-semibold text-blue-300">{log.domain}</span>
            <span className="text-gray-400">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="mt-1 text-white">{log.message}</div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>Level: {log.level}</div>
            <div>Page: {log.page}</div>
            <div>User: {log.userId}</div>
            <div>Event: {log.eventIndex}</div>
          </div>

          {log.data && (
            <pre className="mt-2 bg-black/30 p-2 rounded text-green-300 text-xs overflow-auto">
              {JSON.stringify(log.data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
