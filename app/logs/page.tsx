"use client";
// app/logs/page.tsx
import { logFromClient } from "@/app/actions/log";
import { useEffect, useMemo, useState } from "react";
import { isSchedulerRunning } from "@/lib/log/scheduler";

type LogRecord = {
  id: string;
  timestamp: string;
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

const levelConfig: Record<string, { label: string; icon: string; color: string }> = {
  info:  { label: "INFO",  icon: "ℹ",  color: "#000080" },
  warn:  { label: "WARN",  icon: "⚠",  color: "#808000" },
  error: { label: "ERROR", icon: "✖",  color: "#800000" },
  debug: { label: "DEBUG", icon: "🐛", color: "#008080" },
  trace: { label: "TRACE", icon: "🔍", color: "#444444" },
};

function Win2kButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "Tahoma, Arial, sans-serif",
        fontSize: "11px",
        padding: "2px 10px",
        minWidth: "75px",
        height: "23px",
        background: disabled
          ? "#d4d0c8"
          : active
          ? "linear-gradient(to bottom, #b0a898 0%, #d4d0c8 100%)"
          : "linear-gradient(to bottom, #ffffff 0%, #d4d0c8 50%, #c0bdb5 100%)",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        outline: active ? "1px dotted #000" : "none",
        outlineOffset: "-3px",
        color: disabled ? "#808080" : "#000000",
        boxShadow: active
          ? "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff"
          : "1px 1px 0 #ffffff, -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #404040",
      }}
    >
      {children}
    </button>
  );
}

function Win2kInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        fontFamily: "Tahoma, Arial, sans-serif",
        fontSize: "11px",
        padding: "2px 4px",
        height: "21px",
        flex: 1,
        background: "#ffffff",
        color: "#000000",
        border: "none",
        outline: "none",
        boxShadow:
          "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff, inset 2px 2px 0 #404040, inset -2px -2px 0 #dfdfdf",
      }}
    />
  );
}

export default function LogsPage() {
  const [newCount, setNewCount] = useState(0);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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
          const result = await logFromClient(
            "jonathan",
            "🌟 in log page",
            "app/logs/page.tsx",
            91,
            { scheduler: isSchedulerRunning() },
          );
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
    return () => { cancelled = true; };
  }, [page, search]);

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
          setNewCount((prev) => prev + fresh.length);
        }
      } catch (e) {
        console.error("Failed to live-tail logs", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [live, logs, search]);

  const hasLogs = logs.length > 0;

  const title = useMemo(() => {
    if (live && search) return "Application Logs — Live Tail + Search";
    if (live) return "Application Logs — Live Tail";
    if (search) return "Application Logs — Search Results";
    return "Application Logs";
  }, [live, search]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div
      style={{
        fontFamily: "Tahoma, Arial, sans-serif",
        fontSize: "11px",
        background: "#d4d0c8",
        minHeight: "100vh",
        padding: "8px",
        color: "#000000",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: "#d4d0c8",
          border: "none",
          boxShadow:
            "2px 2px 0 #ffffff, -2px -2px 0 #808080, 1px 1px 0 #dfdfdf, -1px -1px 0 #404040",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(to right, #000080, #1084d0)",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* tiny icon */}
            <span style={{ fontSize: "14px" }}>📋</span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "bold",
                fontFamily: "Tahoma, Arial, sans-serif",
              }}
            >
              {title}
            </span>
          </div>
          {/* Window controls */}
          <div style={{ display: "flex", gap: "2px" }}>
            {["_", "□", "✕"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: "16px",
                  height: "14px",
                  background: "#d4d0c8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: "bold",
                  boxShadow:
                    "1px 1px 0 #ffffff, -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #404040",
                  cursor: "pointer",
                  color: "#000000",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #808080",
            display: "flex",
            gap: "0",
            padding: "1px 2px",
          }}
        >
          {["File", "Edit", "View", "Tools", "Help"].map((item) => (
            <div
              key={item}
              style={{
                padding: "2px 8px",
                fontSize: "11px",
                cursor: "default",
                color: "#000000",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#000080";
                (e.currentTarget as HTMLElement).style.color = "#ffffff";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#000000";
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "2px solid #808080",
            padding: "3px 4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          {/* Live tail toggle */}
          <Win2kButton onClick={() => setLive((l) => !l)} active={live}>
            {live ? "⏹ Stop Live" : "▶ Live Tail"}
          </Win2kButton>

          {/* Separator */}
          <div
            style={{
              width: "1px",
              height: "22px",
              background: "#808080",
              margin: "0 2px",
              boxShadow: "1px 0 0 #ffffff",
            }}
          />

          {/* Search */}
          <label style={{ fontSize: "11px", whiteSpace: "nowrap" }}>Search:</label>
          <Win2kInput
            value={search}
            onChange={(v) => { setPage(0); setSearch(v); }}
            placeholder="message, level, file, requestId…"
          />
          <Win2kButton
            onClick={() => { setPage(0); setSearch(""); }}
          >
            Clear
          </Win2kButton>

          {/* Separator */}
          <div
            style={{
              width: "1px",
              height: "22px",
              background: "#808080",
              margin: "0 2px",
              boxShadow: "1px 0 0 #ffffff",
            }}
          />

          {/* New-count badge */}
          {newCount > 0 && (
            <div
              onClick={() => setNewCount(0)}
              style={{
                background: "#ffff00",
                border: "1px solid #808000",
                padding: "1px 6px",
                fontSize: "11px",
                cursor: "pointer",
                color: "#000000",
              }}
            >
              +{newCount} new
            </div>
          )}

          {/* Live indicator */}
          {live && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#00aa00",
                  display: "inline-block",
                  animation: "blink 1s step-start infinite",
                }}
              />
              <span style={{ color: "#008000", fontWeight: "bold", fontSize: "11px" }}>
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Status / address bar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #808080",
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#000080", fontWeight: "bold" }}>
            Address:
          </span>
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              padding: "1px 4px",
              fontSize: "11px",
              boxShadow:
                "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff",
              color: "#000080",
            }}
          >
            {typeof window !== "undefined" ? window.location.href : "/logs"}
          </div>
          <Win2kButton>Go</Win2kButton>
        </div>

        {/* Main content pane */}
        <div
          style={{
            background: "#ffffff",
            margin: "4px",
            boxShadow:
              "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff, inset 2px 2px 0 #404040, inset -2px -2px 0 #dfdfdf",
            minHeight: "500px",
          }}
        >
          {/* Column header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 60px 1fr 160px",
              background: "#d4d0c8",
              borderBottom: "1px solid #808080",
            }}
          >
            {["Level", "Icon", "Message / Details", "Timestamp"].map((h) => (
              <div
                key={h}
                style={{
                  padding: "3px 6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRight: "1px solid #808080",
                  boxShadow: "inset -1px 0 0 #ffffff",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Log rows */}
          {isLoading && !hasLogs ? (
            <div style={{ padding: "12px 8px", color: "#000080", fontSize: "11px" }}>
              <img
                src="/placeholder.svg?height=16&width=16"
                alt=""
                style={{ verticalAlign: "middle", marginRight: "4px" }}
              />
              Loading logs, please wait…
            </div>
          ) : !hasLogs ? (
            <div style={{ padding: "12px 8px", color: "#808080", fontSize: "11px" }}>
              No log entries found.
            </div>
          ) : (
            <div>
              {logs.map((log, idx) => {
                const cfg = levelConfig[log.level] ?? levelConfig.info;
                const key = log.timestamp + idx;
                const isExpanded = expanded.has(key);
                const isEven = idx % 2 === 0;

                return (
                  <div key={key}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 60px 1fr 160px",
                        background: isEven ? "#ffffff" : "#f0f0e8",
                        borderBottom: "1px solid #e0e0d8",
                        cursor: "default",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#000080";
                        (e.currentTarget as HTMLElement).style.color = "#ffffff";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isEven
                          ? "#ffffff"
                          : "#f0f0e8";
                        (e.currentTarget as HTMLElement).style.color = "#000000";
                      }}
                    >
                      {/* Level badge */}
                      <div
                        style={{
                          padding: "4px 6px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: cfg.color,
                          borderRight: "1px solid #d0d0c8",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {cfg.label}
                      </div>

                      {/* Icon */}
                      <div
                        style={{
                          padding: "4px 6px",
                          fontSize: "14px",
                          borderRight: "1px solid #d0d0c8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cfg.icon}
                      </div>

                      {/* Message + meta */}
                      <div style={{ padding: "4px 6px", borderRight: "1px solid #d0d0c8" }}>
                        <div style={{ fontWeight: "bold", fontSize: "11px" }}>{log.message}</div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "2px",
                          }}
                        >
                          {log.file && (
                            <span
                              style={{
                                background: "#d4d0c8",
                                border: "1px solid #808080",
                                padding: "0 4px",
                                fontSize: "10px",
                              }}
                            >
                              {log.file}{log.line ? `:${log.line}` : ""}
                            </span>
                          )}
                          {log.requestId && (
                            <span
                              style={{
                                background: "#d4d0c8",
                                border: "1px solid #808080",
                                padding: "0 4px",
                                fontSize: "10px",
                              }}
                            >
                              req: {log.requestId.slice(0, 8)}…
                            </span>
                          )}
                          {log.page && (
                            <span
                              style={{
                                background: "#d4d0c8",
                                border: "1px solid #808080",
                                padding: "0 4px",
                                fontSize: "10px",
                              }}
                            >
                              page: {log.page}
                            </span>
                          )}
                          {log.sessionEmail && (
                            <span
                              style={{
                                background: "#d4d0c8",
                                border: "1px solid #808080",
                                padding: "0 4px",
                                fontSize: "10px",
                              }}
                            >
                              {log.sessionEmail}
                            </span>
                          )}
                          {/* Expand toggle */}
                          <button
                            onClick={() => toggleExpand(key)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "10px",
                              color: "#000080",
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: 0,
                            }}
                          >
                            {isExpanded ? "[-] Hide" : "[+] Details"}
                          </button>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div
                        style={{
                          padding: "4px 6px",
                          fontSize: "10px",
                          color: "#444",
                          fontFamily: "Courier New, monospace",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <div
                        style={{
                          background: "#fffde8",
                          borderBottom: "1px solid #c0c0b8",
                          padding: "6px 8px",
                          borderLeft: "4px solid #000080",
                        }}
                      >
                        <pre
                          style={{
                            fontFamily: "Courier New, monospace",
                            fontSize: "10px",
                            color: "#000000",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            margin: 0,
                          }}
                        >
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom toolbar / load more */}
        {hasLogs && (
          <div
            style={{
              background: "#d4d0c8",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderTop: "1px solid #808080",
              margin: "0 4px 4px 4px",
            }}
          >
            <Win2kButton
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading…" : "Load Next 50"}
            </Win2kButton>
          </div>
        )}

        {/* Status bar */}
        <div
          style={{
            background: "#d4d0c8",
            borderTop: "2px solid #808080",
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              flex: 1,
              fontSize: "11px",
              boxShadow: "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff",
              padding: "1px 4px",
            }}
          >
            {isLoading
              ? "Loading…"
              : `${logs.length} object(s)`}
          </div>
          <div
            style={{
              fontSize: "11px",
              boxShadow: "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff",
              padding: "1px 8px",
            }}
          >
            {live ? "● Live" : "Ready"}
          </div>
          <div
            style={{
              fontSize: "11px",
              boxShadow: "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff",
              padding: "1px 8px",
            }}
          >
            Local intranet
          </div>
        </div>
      </div>

      {/* Blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
