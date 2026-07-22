/*
 * @FilePath: \my-new-app\app\components\dashboard\version-card.tsx
 * @LastEditTime: 2026-07-21 18:15:43
 */
import { useVersionSWR } from "@/hooks/useVersionSWR";

export default function VersionCard({ pkg }: { pkg?: string }) {
  const { data, loading, error } = useVersionSWR(pkg);

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-gray-900 text-gray-300">
        <p>Loading version info…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg bg-red-900 text-red-200">
        <p>Error loading version info: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-gray-900 text-gray-200 border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">
        {data.name} Version Dashboard
      </h2>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">App Version:</span>{" "}
          <span>{data.version ?? "unknown"}</span>
        </div>

        {pkg && (
          <div>
            <span className="font-medium">Package:</span>{" "}
            <span>{data.package}</span>
          </div>
        )}

        <div>
          <span className="font-medium">Build Time:</span>{" "}
          <span>{data.buildTime ?? "unknown"}</span>
        </div>

        <div>
          <span className="font-medium">Commit SHA:</span>{" "}
          <span className="font-mono">{data.commit ?? "unknown"}</span>
        </div>
      </div>
    </div>
  );
}
