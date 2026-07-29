"use client";
// app\components\dashboard\version-card.tsx
import { useVersionSWR } from "@/hooks/useVersionSWR";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
const built = await staticUniversalContext("dashboard");
let jei = 0;

logj({
  domain: "dashboard",
  level: "info",
  message: "VersionCard loaded",
  file: "app\components\dashboard\version-card.tsx",
  line: 9,
  payload: { some: "Version Card loaded" },
  meta: { built: { ...built, eventIndex: ++jei } },
});

export default function VersionCard() {
  const app = useVersionSWR();

  const react = useVersionSWR("react");
  const next = useVersionSWR("next");
  const dateFns = useVersionSWR("date-fns");
  const typescript = useVersionSWR("typescript");
  const eslint = useVersionSWR("eslint");
  const all = useVersionSWR("all");

  const deps = [
    { pkg: "react", label: "React", ...react },
    { pkg: "next", label: "Next.js", ...next },
    { pkg: "date-fns", label: "date-fns", ...dateFns },
    { pkg: "typescript", label: "TypeScript", ...typescript },
    { pkg: "eslint", label: "ESLint", ...eslint },
    { pkg: "all", label: "all", ...all },
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
      <div className="space-y-3">
        {deps.map((d) => {
          const version = d.data?.version;
          const isLoading = d.loading;
          const isError = d.error;

          return (
            <div
              key={d.pkg}
              className="flex items-center justify-between text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{d.label}:</span>
                {isLoading ? (
                  <span className="text-gray-400">loading…</span>
                ) : isError ? (
                  <span className="text-red-400">error</span>
                ) : (
                  <span className="font-mono">{version}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
