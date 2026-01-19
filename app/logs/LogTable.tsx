// app/logs/LogTable.tsx
"use client";

import { useState } from "react";

type Log = {
  id: string;
  level: string;
  message: string;
  createdAt: string | Date;
  page?: string | null;
  file?: string | null;
  line?: number | null;
  data?: any;
  userId?: string | null;
  ipAddress?: string | null;
};

type LogTableProps = {
  logs: Log[];
};

export default function LogTable({ logs }: LogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      {logs.map((log) => (
        <div
          key={log.id}
          onClick={() => toggle(log.id)}
          className="cursor-pointer border-b py-2 hover:bg-slate-50"
        >
          <div className="flex justify-between">
            <div className="font-mono text-sm">{log.level.toUpperCase()}</div>
            <div className="text-xs text-gray-500">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>

          <div>{log.message}</div>

          {expandedId === log.id && (
            <pre className="mt-3 bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap">
              {JSON.stringify(log, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
