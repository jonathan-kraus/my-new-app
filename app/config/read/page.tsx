"use client";

import { useEffect, useState } from "react";
import { logit } from "@/lib/log/logit.client";
function formatRow(row: Record<string, any> | null) {
  if (!row) return <div className="text-slate-400">No data</div>;

  const d = row.data ?? {};

  const direct = {
    id: d.id ?? "-",
    reason: d.reason ?? "-",
    message: d.message ?? "-",
    Variable01: d.Variable01 ?? "-",
    Variable02: d.Variable02 ?? "-",
    Variable03: d.Variable03 ?? "-",
  };

  return (
    <div className="space-y-1 text-xs bg-slate-950 p-3 rounded">
      <div>
        <strong>ID:</strong> {direct.id}
      </div>
      <div>
        <strong>Reason:</strong> {direct.reason}
      </div>
      <div>
        <strong>Message:</strong> {direct.message}
      </div>
      <div>
        <strong>Variable01:</strong> {direct.Variable01}
      </div>
      <div>
        <strong>Variable02:</strong> {direct.Variable02}
      </div>
      <div>
        <strong>Variable03:</strong> {direct.Variable03}
      </div>
      <div>
        <strong>Raw:</strong>{" "}
        <pre className="overflow-auto">{JSON.stringify(row, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function ConfigReadPage() {
  const [flight, setFlight] = useState<Record<string, any> | null>(null);
  const [weather, setWeather] = useState<Record<string, any> | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    flights: number;
    weather: number;
    lastUpdated: string | null;
  } | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>(
    new Date().toLocaleTimeString(),
  );

  const loadData = async () => {
    setStatus("loading...");
    setError(null);
    try {
      const res = await fetch("/api/config/read");
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = await res.json();
      setFlight(json.flight ?? null);
      setWeather(json.weather ?? null);
      setStats(json.stats ?? null);
      setUpdatedAt(new Date().toLocaleTimeString());
      setStatus("loaded");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  const ctx = {
    requestId: crypto.randomUUID(),
    route: "Github Webhook",
    page: "workflow",
    userId: "JK",
  };
  logit(
    "jonathan",
    { level: "info", message: "In config read" },
    { Flight: flight, Weather: weather, Stats: stats },
    {
      requestId: ctx.requestId,
      route: ctx.page,
      userId: ctx.userId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-4 text-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Latest Config Data</h1>
          <p className="text-xs text-slate-300">Last refreshed: {updatedAt}</p>
        </div>
        <button
          onClick={loadData}
          className="rounded bg-sky-600 px-3 py-1 text-sm font-medium hover:bg-sky-500"
        >
          Refresh
        </button>
      </div>

      <div className="text-sm">
        Status: <strong>{status}</strong>
        {error ? <span className="ml-2 text-red-300">{error}</span> : null}
      </div>
      <div className="text-sm text-emerald-200">
        Dataset: <strong>config</strong>
      </div>
      <div className="text-sm text-slate-300">
        Count:{" "}
        <strong>{status === "loaded" ? (stats?.total ?? "-") : "-"}</strong>
        {stats?.lastUpdated ? (
          <span className="ml-2">
            Last: {new Date(stats.lastUpdated).toLocaleString()}
          </span>
        ) : null}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-slate-900 p-4 rounded border border-slate-700">
          <h2 className="text-lg font-semibold text-cyan-300">
            Last Flight entry
          </h2>
          {formatRow(flight)}
        </section>
        <section className="bg-slate-900 p-4 rounded border border-slate-700">
          <h2 className="text-lg font-semibold text-emerald-300">
            Last Weather entry
          </h2>
          {formatRow(weather)}
        </section>
      </div>
    </div>
  );
}
