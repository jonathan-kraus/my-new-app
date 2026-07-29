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

  const all = useVersionSWR("all");


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


    </div>
  );
}
