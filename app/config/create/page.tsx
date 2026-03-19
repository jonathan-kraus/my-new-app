"use client";

import { useState } from "react";

export default function AxiomConfig() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async () => {
    setStatus("saving...");
    setError(null);
    try {
      const events = [
        {
          id: crypto.randomUUID(),
          reason: "Flight",
          message: "Config for favorite flights",
          Variable01: "AA1976",
          Variable02: "AA607",
          Variable03: "AA1211",
        },
        {
          id: crypto.randomUUID(),
          reason: "Weather",
          message: "Config for favorite cities",
          Variable01: "KOP",
          Variable02: "Brookline",
          Variable03: "Williamstown",
        },
      ];

      const res = await fetch("/api/config/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, dataset: "config" }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || `status ${res.status}`);
      }

      setStatus("ingest success");
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Config Ingest</h1>
      <p>Trigger config ingest to Axiom (same API used by cron).</p>

      <button
        onClick={handleIngest}
        className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
      >
        Ingest Config Now
      </button>

      <div className="mt-2 text-sm">
        {status === "saving..." && (
          <span className="text-yellow-300">Saving...</span>
        )}
        {status === "ingest success" && (
          <span className="text-emerald-300">Ingest succeeded ✅</span>
        )}
        {status === "failed" && (
          <span className="text-red-300">Ingest failed</span>
        )}
      </div>

      {error ? <div className="text-red-400">Error: {error}</div> : null}
    </div>
  );
}
