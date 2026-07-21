/*
 * @FilePath: \my-new-app\app\logview\LogViewer.tsx
 * @LastEditTime: 2026-07-20 21:50:30
 */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Log {
  id: number;
  level: string;
  message: string;
  requestId: string | null;
  domain: string;
  payload: Record<string, unknown>;
  meta: Record<string, unknown> | null;
  userId: string | null;
  sessionEmail: string | null;
  sessionUser: string | null;
  file: string | null;
  line: number | null;
  created_at: string;
}

interface ApiResponse {
  logs: Log[];
  total: number;
  domains: { domain: string; count: number }[];
  levels: { level: string; count: number }[];
  limit: number;
  offset: number;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_BADGE: Record<string, string> = {
  error: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  debug: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const LEVEL_DOT: Record<string, string> = {
  error: "bg-red-500",
  warn: "bg-amber-400",
  info: "bg-blue-500",
  debug: "bg-zinc-400",
};

const WINDOWS = [
  { value: "1h", label: "Last 1h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "all", label: "All time" },
];

const TAIL_INTERVALS = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 30, label: "30s" },
];

const PAGE_SIZE = 100;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LogViewer() {
  // ─── Helpers (now inside the client component) ──────────────────────────────

  function fmtTs(iso: string) {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
  }

  function JsonBlock({ value }: { value: unknown }) {
    if (!value || typeof value !== "object") {
      return (
        <pre className="text-xs text-zinc-500">{String(value ?? "null")}</pre>
      );
    }

    return (
      <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  function KV({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) {
    return (
      <div className="flex gap-3 text-xs py-[3px]">
        <span className="text-zinc-400 dark:text-zinc-500 min-w-[110px] shrink-0 font-sans">
          {label}
        </span>
        <span
          className={
            value === null || value === undefined ?
              "italic text-zinc-300 dark:text-zinc-600"
            : "text-zinc-700 dark:text-zinc-200 break-all"
          }
        >
          {value === null || value === undefined ? "null" : String(value)}
        </span>
      </div>
    );
  }

  // ─── State ───────────────────────────────────────────────────────────────────

  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [domains, setDomains] = useState<{ domain: string; count: number }[]>(
    [],
  );
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [window, setWindow] = useState<string>("24h");
  const [tailInterval, setTailInterval] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const tailTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Data Fetching / Effects (simplified skeleton) ──────────────────────────

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        window,
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });

      const res = await fetch(`/api/logs?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ApiResponse = await res.json();
      console.log("API response:", data);
      console.log("API response: logs", data.logs);
      console.log("API response: total", data.total);
      console.log("API response: domains", data.domains);
      console.log("API response: levels", data.levels);
      setLogs(data.logs);
      setTotal(data.total);
      setDomains(data.domains);
      setLevelCounts(
        (data.levels ?? []).reduce(
          (acc, { level, count }) => ({ ...acc, [level]: count }),
          {},
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [window, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (tailTimerRef.current) {
      clearInterval(tailTimerRef.current);
      tailTimerRef.current = null;
    }

    if (tailInterval) {
      tailTimerRef.current = setInterval(fetchLogs, tailInterval * 1000);
    }

    return () => {
      if (tailTimerRef.current) {
        clearInterval(tailTimerRef.current);
      }
    };
  }, [tailInterval, fetchLogs]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 space-y-4">
      {/* Controls: window, tail, pagination */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* window selector */}
        <select
          className="border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-900"
          value={window}
          onChange={(e) => {
            setPage(0);
            setWindow(e.target.value);
          }}
        >
          {WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>

        {/* tail selector */}
        <select
          className="border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-900"
          value={tailInterval ?? ""}
          onChange={(e) =>
            setTailInterval(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Tail: off</option>
          {TAIL_INTERVALS.map((t) => (
            <option key={t.value} value={t.value}>
              Tail: {t.label}
            </option>
          ))}
        </select>

        {/* pagination */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {page + 1} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
          <button
            className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded disabled:opacity-40"
            disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() =>
              setPage((p) => ((p + 1) * PAGE_SIZE >= total ? p : p + 1))
            }
          >
            Next
          </button>
        </div>
      </div>

      {/* Error / loading */}
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      )}
      {loading && <div className="text-xs text-zinc-500">Loading logs…</div>}

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div>
          <div className="text-zinc-400">Total logs</div>
          <div className="text-zinc-900 dark:text-zinc-100 font-medium">
            {total}
          </div>
        </div>
        <div>
          <div className="text-zinc-400">By level</div>
          <div className="flex gap-2 mt-1">
            {Object.entries(levelCounts).map(([level, count]) => (
              <span
                key={level}
                className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[11px] ${LEVEL_BADGE[level] ?? ""}`}
              >
                <span
                  className={`w-[6px] h-[6px] rounded-full ${LEVEL_DOT[level] ?? ""}`}
                />
                {level}: {count}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-zinc-400">By domain</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {domains.map((d) => (
              <span
                key={d.domain}
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
              >
                {d.domain}: {d.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border border-zinc-200 dark:border-zinc-700 rounded-md p-3 bg-white dark:bg-zinc-900"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[11px] ${LEVEL_BADGE[log.level] ?? ""}`}
                >
                  <span
                    className={`w-[6px] h-[6px] rounded-full ${LEVEL_DOT[log.level] ?? ""}`}
                  />
                  {log.level}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {fmtTs(log.created_at)}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">#{log.id}</span>
            </div>

            <div className="mt-2 text-sm text-zinc-800 dark:text-zinc-100">
              {log.message}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <KV label="domain" value={log.domain} />
                <KV label="requestId" value={log.requestId} />
                <KV label="userId" value={log.userId} />
                <KV label="sessionEmail" value={log.sessionEmail} />
                <KV label="sessionUser" value={log.sessionUser} />
                <KV label="file" value={log.file} />
                <KV label="line" value={log.line} />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-[11px] text-zinc-400 mb-1">payload</div>
                  <JsonBlock value={log.payload} />
                </div>
                {log.meta && (
                  <div>
                    <div className="text-[11px] text-zinc-400 mb-1">meta</div>
                    <JsonBlock value={log.meta} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!logs.length && !loading && !error && (
          <div className="text-xs text-zinc-500">
            No logs found for this window.
          </div>
        )}
      </div>
    </div>
  );
}
