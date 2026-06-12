"use client";

import { useEffect, useState } from "react";
import { formatEastern } from "@/lib/utils/global";

type ConfigRow = {
  id?: string;
  reason?: string;
  message?: string;
  Variable01?: string;
  Variable02?: string;
  Variable03?: string;
  _time?: string;
  [key: string]: any;
};

type Stats = {
  total: number;
  flights: number;
  weather: number;
  lastUpdated: string | null;
};

function ConfigCard({ title, row }: { title: string; row: ConfigRow | null }) {
  if (!row) {
    return (
      <div className="text-slate-400 text-sm bg-slate-900 p-4 rounded border border-slate-700">
        No data
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs bg-slate-900 p-4 rounded border border-slate-700">
      <h2 className="text-lg font-semibold text-cyan-300">{title}</h2>

      <div>
        <strong>ID:</strong> {row.id ?? "-"}
      </div>
      <div>
        <strong>Reason:</strong> {row.reason ?? "-"}
      </div>
      <div>
        <strong>Message:</strong> {row.message ?? "-"}
      </div>
      <div>
        <strong>Variable01:</strong> {row.Variable01 ?? "-"}
      </div>
      <div>
        <strong>Variable02:</strong> {row.Variable02 ?? "-"}
      </div>
      <div>
        <strong>Variable03:</strong> {row.Variable03 ?? "-"}
      </div>

      {/* <div className="pt-2">
        <strong>Raw:</strong>
        <pre className="overflow-auto mt-1 bg-slate-950 p-2 rounded">
          {JSON.stringify(row, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}

export default function ConfigReadPage() {
  const [flight, setFlight] = useState<ConfigRow | null>(null);
  const [weather, setWeather] = useState<ConfigRow | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>(
    new Date().toLocaleTimeString(),
  );

  async function loadData() {
    setStatus("loading");
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
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-4 text-slate-100">
      {/* Header */}
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

      {/* Status */}
      <div className="text-sm">
        Status: <strong>{status}</strong>
        {error && <span className="ml-2 text-red-300">{error}</span>}
      </div>

      {/* Stats */}
      <div className="text-sm text-emerald-200">
        Dataset: <strong>config</strong>
      </div>

      <div className="text-sm text-slate-300">
        Count: <strong>{stats?.total ?? "-"}</strong>
        {stats?.lastUpdated && (
          <span className="ml-2">Last: {formatEastern(stats.lastUpdated)}</span>
        )}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <ConfigCard title="Last Flight Entry" row={flight} />
        <ConfigCard title="Last Weather Entry" row={weather} />
      </div>
    </div>
  );
}
