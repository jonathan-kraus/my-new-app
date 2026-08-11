/*
 * @FilePath: \my-new-app\app\components\dashboard\version-card.tsx
 * @LastEditTime: 2026-08-03 20:07:50
 */
"use client";
// app\components\dashboard\version-card.tsx
import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";

const built = await staticUniversalContext("dashboard");
let jei = 0;

logj({
  domain: "dashboard",
  level: "info",
  message: "VersionCard loaded",
  file: "app/components/dashboard/version-card.tsx",
  line: 14,
  payload: { some: "Version Card loaded" },
  meta: { built: { ...built, eventIndex: ++jei } },
});

export default function VersionCard() {
  const data = getFullPackageData();

  return (
    <div className="rounded-lg border bg-card p-4 text-sm">
      <div className="font-mono text-xs mb-2">
        {data.name} @ {data.version}
      </div>

      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(
          {
            buildTime: data.buildTime,
            commit: data.commit,
            dependencies: data.dependencies,
            devDependencies: data.devDependencies,
            overrides: data.overrides,
            workspacePackages: data.workspacePackages,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
