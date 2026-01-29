"use client";
// app/logs/page.tsx
import { logFromClient } from "@/app/actions/log";
import { useEffect, useMemo, useState } from "react";

type LogRecord = {
  id: string;
  level: string;
  message: string;
  created_at: string;
  file: string | null;
  line: number | null;
  requestId: string;
  page: string;
  userId: string;
  sessionEmail: string | null;
  sessionUser: string | null;
  data: any | null;
};
const ctx = {
  requestId: crypto.randomUUID(),
  page: "log",
  userId: null,
};

const levelStyles: Record<
  string,
  {
    icon: string;
    color: string;
    badgeBg: string;
  }
> = {
  info: {
    icon: "ℹ️",
    color: "text-blue-400",
    badgeBg: "bg-blue-500/20",
  },
  warn: {
    icon: "⚠️",
    color: "text-yellow-400",
    badgeBg: "bg-yellow-500/20",
  },
  error: {
    icon: "⛔",
    color: "text-red-400",
    badgeBg: "bg-red-500/20",
  },
  debug: {
    icon: "🐛",
    color: "text-purple-400",
    badgeBg: "bg-purple-500/20",
  },
  trace: {
    icon: "🔍",
    color: "text-gray-400",
    badgeBg: "bg-gray-500/20",
  },
};

export default function LogsPage() {
  const [newCount, setNewCount] = useState(0);

  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial + paginated fetch
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (page === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        if (search) params.set("q", search);

        const res = await fetch(`/api/logs?${params.toString()}`);
        const json = await res.json();
        try {
          const result = await logFromClient("jonathan", {
            level: "info",
            message: "in log page",
          });
          console.log("logFromClient result:", result);
        } catch (err) {
          console.error("logFromClient failed:", err);
        }

        if (cancelled) return;

        if (page === 0) {
          setLogs(json.logs ?? []);
        } else {
          setLogs((prev) => [...prev, ...(json.logs ?? [])]);
        }
      } catch (e) {
        console.error("Failed to load logs", e);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  // Live tail polling
  useEffect(() => {
    if (!live) return;

    const interval = setInterval(async () => {
      try {
        const newest = logs[0];
        const since = newest?.created_at ?? new Date(0).toISOString();

        const params = new URLSearchParams();
        params.set("since", since);
        if (search) params.set("q", search);

        const res = await fetch(`/api/logs/latest?${params.toString()}`);
        const json = await res.json();
        const fresh: LogRecord[] = json.logs ?? [];

        if (fresh.length > 0) {
          setLogs((prev) => [...fresh, ...prev]);
          setNewCount(prev => prev + fresh.length);
        }
      } catch (e) {
        console.error("Failed to live-tail logs", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [live, logs, search]);

  const hasLogs = logs.length > 0;

  const title = useMemo(() => {
    if (live && search) return "Logs (Live Tail + Search)";
    if (live) return "Logs (Live Tail)";
    if (search) return "Logs (Search)";
    return "Logs";
  }, [live, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          {newCount > 0 && (
  <button
    onClick={() => setNewCount(0)}
    className="mb-3 px-3 py-1 bg-green-500/20 border border-green-500/40
               text-green-300 rounded-lg text-sm font-medium"
  >
    +{newCount} new log{newCount === 1 ? "" : "s"}
  </button>
)}

          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-gray-400">
              Local application logs with search, pagination, and live tail.
            </p>
          </div>

          <button
            onClick={() => setLive((l) => !l)}
            className={`px-3 py-1 rounded-lg border text-sm transition flex items-center gap-2 ${
              live
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-white/5 border-white/20 text-gray-200"
            }`}
          >
            <span className={live ? "animate-pulse" : ""}>●</span>
            {live ? "Stop Live Tail" : "Start Live Tail"}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <input
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            placeholder="Search logs by message, level, file, requestId…"
            className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={() => {
              setPage(0);
              setSearch("");
            }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition"
          >
            Clear
          </button>
        </div>

        {/* Logs list */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          {isLoading && !hasLogs ? (
            <p className="text-gray-400 text-sm">Loading logs…</p>
          ) : !hasLogs ? (
            <p className="text-gray-500 text-sm">No logs found.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => {
                const style = levelStyles[log.level] ?? levelStyles.info;

                return (
                  <li
                    key={log.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    {/* Top row: icon, message, time */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className={`text-xl ${style.color}`}>
                          {style.icon}
                        </span>
                        <div>
                          <div className="font-semibold text-white">
                            {log.message}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 items-center text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full ${style.badgeBg} ${style.color}`}
                            >
                              {log.level.toUpperCase()}
                            </span>

                            {log.file && (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                {log.file}
                                {log.line ? `:${log.line}` : ""}
                              </span>
                            )}

                            {log.requestId && (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                req: {log.requestId}
                              </span>
                            )}

                            {log.page && (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                page: {log.page}
                              </span>
                            )}

                            {log.sessionEmail && (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                user: {log.sessionEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Full record */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-400 text-sm">
                        View full record
                      </summary>
                      <pre className="mt-2 text-xs bg-black/40 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pagination / load more */}
          {hasLogs && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoadingMore}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-gray-100 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoadingMore ? "Loading…" : "Load next 50"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
