/*
 * @FilePath: \my-new-app\app\components\dashboard\version-card.tsx
 * @LastEditTime: 2026-09-05 15:05:40
 */
"use client";

import { getFullPackageData } from "@/lib/version/get-full-package-data";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";

export default function VersionCard() {
  const data = getFullPackageData();
  const built = buildUniversalContext({} as any, "VERSION_CARD");
  let jei = 0;
  logj({
    domain: "VERSION_CARD",
    level: "info",
    message: "Version card loaded",
    file: "app/components/dashboard/version-card.tsx",
    line: 17,
    payload: { data: data },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
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
