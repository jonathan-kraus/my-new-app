/*
 * @FilePath: \my-new-app\app\logview\page.tsx
 * @LastEditTime: 2026-05-17 01:48:03
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

const PAGE_SIZE = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return (
    <pre className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 text-[11px] leading-relaxed overflow-auto max-h-52 font-mono text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap break-all">
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
          value === null || value === undefined
            ? "italic text-zinc-300 dark:text-zinc-600"
            : "text-zinc-700 dark:text-zinc-200 break-all"
        }
      >
        {value === null || value === undefined ? "null" : String(value)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LogViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [domains, setDomains] = useState<{ domain: string; count: number }[]>(
    [],
  );
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [window_, setWindow] = useState("24h");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = useCallback(
    async (opts?: { reset?: boolean }) => {
      setLoading(true);
      setError(null);
      const off = opts?.reset ? 0 : offset;
      if (opts?.reset) setOffset(0);

      const params = new URLSearchParams({
        window: window_,
        limit: String(PAGE_SIZE),
        offset: String(off),
      });
      if (selectedLevel !== "all") params.set("level", selectedLevel);
      if (selectedDomain !== "all") params.set("domain", selectedDomain);
      if (search.trim()) params.set("search", search.trim());

      try {
        const res = await fetch(`/api/logview?${params}`);
        const data: ApiResponse = await res.json();
        if (!res.ok || data.error)
          throw new Error(data.error ?? "Unknown error");

        setLogs(data.logs);
        setTotal(data.total);
        setDomains(data.domains);
        const lc: Record<string, number> = {};
        data.levels.forEach((r) => {
          lc[r.level] = r.count;
        });
        setLevelCounts(lc);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [selectedLevel, selectedDomain, window_, search, offset],
  );

  // Re-fetch when filters change (reset pagination)
  useEffect(() => {
    fetchLogs({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, selectedDomain, window_]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchLogs({ reset: true }), 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Pagination
  useEffect(() => {
    if (offset > 0) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const totalAll = Object.values(levelCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-mono text-sm overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col py-4 overflow-y-auto">
        <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-4 mb-3">
          Level
        </p>

        {[
          ["all", "All", totalAll],
          ["error", "Error", levelCounts.error ?? 0],
          ["warn", "Warn", levelCounts.warn ?? 0],
          ["info", "Info", levelCounts.info ?? 0],
          ["debug", "Debug", levelCounts.debug ?? 0],
        ].map(([val, label, cnt]) => (
          <button
            key={val}
            onClick={() => setSelectedLevel(String(val))}
            className={`flex items-center gap-2 w-full px-4 py-1.5 text-xs font-sans text-left transition-colors rounded-none
              ${
                selectedLevel === val
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[String(val)] ?? "bg-zinc-300"}`}
            />
            {label}
            <span className="ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded-full">
              {cnt}
            </span>
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-4 mb-3">
            Domain
          </p>
          {[{ domain: "all", count: totalAll }, ...domains].map(
            ({ domain, count }) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`flex items-center gap-2 w-full px-4 py-1.5 text-xs font-sans text-left transition-colors
                ${
                  selectedDomain === domain
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                {domain === "all" ? "All" : domain}
                <span className="ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            ),
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message, requestId, user…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 font-mono text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          <select
            value={window_}
            onChange={(e) => setWindow(e.target.value)}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none font-sans cursor-pointer"
          >
            {WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchLogs({ reset: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-sans">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-3 py-2 w-36">
                    Timestamp
                  </th>
                  <th className="text-left text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-3 py-2 w-16">
                    Level
                  </th>
                  <th className="text-left text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-3 py-2">
                    Message
                  </th>
                  <th className="text-left text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-3 py-2 w-28">
                    Domain
                  </th>
                  <th className="text-left text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 px-3 py-2 w-28">
                    User
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() =>
                      setSelectedLog(selectedLog?.id === log.id ? null : log)
                    }
                    className={`border-b border-zinc-100 dark:border-zinc-800/60 cursor-pointer transition-colors
                      ${
                        selectedLog?.id === log.id
                          ? "bg-blue-50 dark:bg-blue-950/40"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                  >
                    <td className="px-3 py-1.5 text-[11px] text-zinc-400 whitespace-nowrap">
                      {fmtTs(log.created_at)}
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${LEVEL_BADGE[log.level] ?? LEVEL_BADGE.debug}`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-3 py-1.5 text-[11px] text-zinc-400 whitespace-nowrap">
                      {log.domain}
                    </td>
                    <td className="px-3 py-1.5 text-[11px] text-zinc-400 truncate max-w-[7rem]">
                      {log.sessionUser ?? log.userId ?? "—"}
                    </td>
                  </tr>
                ))}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 text-zinc-400 font-sans text-sm"
                    >
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Detail Panel ──────────────────────────────────── */}
          {selectedLog && (
            <aside className="w-96 shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${LEVEL_BADGE[selectedLog.level] ?? LEVEL_BADGE.debug}`}
                  >
                    {selectedLog.level}
                  </span>
                  <span className="text-xs font-sans text-zinc-400">
                    #{selectedLog.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 mb-2">
                    Core
                  </p>
                  <KV label="timestamp" value={fmtTs(selectedLog.created_at)} />
                  <KV label="domain" value={selectedLog.domain} />
                  <KV label="message" value={selectedLog.message} />
                  <KV label="requestId" value={selectedLog.requestId} />
                  <KV
                    label="file"
                    value={
                      selectedLog.file
                        ? `${selectedLog.file}${selectedLog.line ? ":" + selectedLog.line : ""}`
                        : null
                    }
                  />
                </div>

                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 mb-2">
                    Session
                  </p>
                  <KV label="userId" value={selectedLog.userId} />
                  <KV label="sessionEmail" value={selectedLog.sessionEmail} />
                  <KV label="sessionUser" value={selectedLog.sessionUser} />
                </div>

                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 mb-2">
                    Payload
                  </p>
                  <JsonBlock value={selectedLog.payload} />
                </div>

                {selectedLog.meta && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-sans font-medium tracking-widest uppercase text-zinc-400 mb-2">
                      Meta
                    </p>
                    <JsonBlock value={selectedLog.meta} />
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-sans text-zinc-400 shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-pulse" : error ? "bg-red-400" : "bg-emerald-500"}`}
          />
          {loading
            ? "Loading…"
            : error
              ? "Error"
              : `${logs.length} of ${total} logs`}
          {!loading && total > PAGE_SIZE && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="disabled:opacity-30 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                ← prev
              </button>
              <span>
                {Math.floor(offset / PAGE_SIZE) + 1} /{" "}
                {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                className="disabled:opacity-30 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
