// app/debug/logs/page.tsx
import { Suspense } from "react";
import LogsTable from "./table";

export const dynamic = "force-dynamic";

export default function DebugLogsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Debug Logs</h1>
      <Suspense fallback={<div>Loading logs…</div>}>
        <LogsTable />
      </Suspense>
    </div>
  );
}
