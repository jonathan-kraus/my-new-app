/*
 * @FilePath: \my-new-app\app\components\dashboard\version-card.tsx
 * @LastEditTime: 2026-09-04 01:13:30
 */
"use client";
// app\components\dashboard\version-card.tsx
import { getFullPackageData } from "@/lib/version/get-full-package-data";

export default function VersionCard() {
  const data = getFullPackageData();
  console.log("version-carddata", data);
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
