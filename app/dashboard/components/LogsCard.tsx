"use client";

import React, { useState } from "react";

export interface LogEntry {
  id: number;
  created_at: string | Date;
  domain: string;
  level: "info" | "warn" | "error";
  message: string;
  file: string;
  line: number;
  payload: Record<string, unknown>;
  meta: {
    built?: {
      requestId: string;
      userId: string | null;
      sessionEmail: string | null;
      sessionUser: string | null;
      route: string;
      eventIndex: number;
      method: string;
      url: string;
      ip?: string;
      userAgent?: string;
    };
    [key: string]: unknown;
  };
}

interface LogsCardProps {
  title?: string;
  logs: LogEntry[];
}

export function LogsCard({ title = "Logs", logs }: LogsCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      {logs.length === 0 && (
        <p className="text-sm text-muted-foreground">No logs available.</p>
      )}

      <ul className="space-y-3">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </ul>
    </div>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-md border p-3 bg-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-medium">{log.message}</span>

          <span className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleString()} — {log.domain}
          </span>

          <span className="text-xs text-muted-foreground">
            {log.file}:{log.line}
          </span>
        </div>

        <span
          className={
            "text-xs font-semibold px-2 py-1 rounded-md " +
            (log.level === "info"
              ? "bg-blue-100 text-blue-700"
              : log.level === "warn"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700")
          }
        >
          {log.level.toUpperCase()}
        </span>
      </div>

      <button
        className="mt-2 text-xs text-blue-600 hover:underline"
        onClick={() => setOpen(!open)}
      >
        {open ? "Hide details" : "Show details"}
      </button>

      {open && (
        <div className="mt-2 text-xs space-y-2">
          <pre className="bg-black/10 p-2 rounded-md overflow-x-auto">
            payload: {JSON.stringify(log.payload, null, 2)}
          </pre>

          <pre className="bg-black/10 p-2 rounded-md overflow-x-auto">
            meta: {JSON.stringify(log.meta, null, 2)}
          </pre>

          {log.meta.built && (
            <pre className="bg-black/10 p-2 rounded-md overflow-x-auto">
              built: {JSON.stringify(log.meta.built, null, 2)}
            </pre>
          )}
        </div>
      )}
    </li>
  );
}
