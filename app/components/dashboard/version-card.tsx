/*
 * @FilePath: \my-new-app\app\components\dashboard\version-card.tsx
 * @LastEditTime: 2026-09-04 01:13:30
 */
"use client";

import { getFullPackageData } from "@/lib/version/get-full-package-data";

export default function VersionCard() {
  const data = getFullPackageData();

  const IGNORE_PREFIXES = [
    "@radix-ui/",
    "@types/",
    "@typescript-eslint/",
    "eslint",
    "typescript",
    "ts-node",
    "vite",
    "vitest",
    "tailwindcss",
    "postcss",
    "autoprefixer",
  ];

  const filteredDeps = Object.fromEntries(
    Object.entries(data.dependencies ?? {}).filter(
      ([name]) => !IGNORE_PREFIXES.some((prefix) => name.startsWith(prefix)),
    ),
  );

  const filteredDevDeps = Object.fromEntries(
    Object.entries(data.devDependencies ?? {}).filter(
      ([name]) => !IGNORE_PREFIXES.some((prefix) => name.startsWith(prefix)),
    ),
  );

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
            dependencies: filteredDeps,
            devDependencies: filteredDevDeps,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
