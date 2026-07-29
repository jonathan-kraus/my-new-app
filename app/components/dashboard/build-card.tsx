/*
 * @FilePath: \my-new-app\app\components\dashboard\build-card.tsx
 * @LastEditTime: 2026-07-22 13:27:02
 */
// app/components/dashboard/build-card.tsx
import type { BuildMetadata } from "@/lib/version/build";

export default function BuildCard({ build }: { build: BuildMetadata }) {
  return (
    <div className="p-4 bg-zinc-900 rounded border border-white/10">
      <h2 className="text-lg font-semibold mb-3">Build Metadata</h2>

      <div className="space-y-3 text-sm text-gray-300">
        {/* Build Timestamp */}
        <div>
          <span className="font-medium">Built:</span>{" "}
          {build.timestamp ?? "unknown"}
        </div>

        {/* Git Info */}
        <div>
          <span className="font-medium">Commit:</span>{" "}
          <span className="font-mono">{build.git?.commit ?? "unknown"}</span>
        </div>

        <div>
          <span className="font-medium">Branch:</span>{" "}
          {build.git?.branch ?? "unknown"}
        </div>

        <hr className="border-white/10" />

        {/* Tool Versions */}
        <div className="space-y-2">
          <div>
            <span className="font-medium">Node:</span>{" "}
            {build.tools?.node ?? "unknown"}
          </div>

          <div>
            <span className="font-medium">pnpm:</span>{" "}
            {build.tools?.pnpm ?? "unknown"}
          </div>

          <div>
            <span className="font-medium">Next.js:</span>{" "}
            {build.tools?.next ?? "unknown"}
          </div>

          <div>
            <span className="font-medium">TypeScript:</span>{" "}
            {build.tools?.typescript ?? "unknown"}
          </div>
          <div>
            <span className="font-medium">ESLint:</span>{" "}
            {build.tools?.eslint ?? "unknown"}
          </div>
          <div>
            <span className="font-medium">Openmeteo:</span>{" "}
            {build.tools?.openmeteo ?? "openmeteo unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}
