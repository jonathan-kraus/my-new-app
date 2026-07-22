"use client";

import { useVersionSWR } from "@/hooks/useVersionSWR";

const PACKAGES = ["react", "next", "date-fns", "typescript"];

export default function VersionCard() {
  const app = useVersionSWR(); // main project version

  // Call hooks individually (React-safe)
  const react = useVersionSWR("react");
  const next = useVersionSWR("next");
  const dateFns = useVersionSWR("date-fns");
  const typescript = useVersionSWR("typescript");

  const deps = [
    { pkg: "react", ...react },
    { pkg: "next", ...next },
    { pkg: "date-fns", ...dateFns },
    { pkg: "typescript", ...typescript },
  ];

  return (
    <div className="p-4 bg-zinc-900 rounded border border-white/10">
      <h2 className="text-lg font-semibold mb-3">Version Dashboard</h2>

      {/* App Version */}
      {app.loading ? (
        <div className="text-gray-400">Loading app version…</div>
      ) : app.error ? (
        <div className="text-red-400">Error: {app.error}</div>
      ) : (
        <div className="mb-4 space-y-1 text-sm text-gray-300">
          <div>
            <span className="font-medium">App Version:</span>{" "}
            {app.data?.version ?? "unknown"}
          </div>
          <div>
            <span className="font-medium">Commit:</span>{" "}
            <span className="font-mono">{app.data?.commit ?? "unknown"}</span>
          </div>
          <div>
            <span className="font-medium">Build Time:</span>{" "}
            {app.data?.buildTime ?? "unknown"}
          </div>
        </div>
      )}

      <hr className="border-white/10 my-3" />

      {/* Dependency Versions */}
      <div className="space-y-2">
        {deps.map((d) => (
          <div key={d.pkg} className="text-sm text-gray-300">
            <span className="font-medium">{d.pkg}:</span>{" "}
            {d.loading
              ? "loading…"
              : d.error
                ? "error"
                : (d.data?.version ?? "unknown")}
          </div>
        ))}
      </div>
    </div>
  );
}
