/*
 * @FilePath: \my-new-app\app\logs\axiom\page.tsx
 * @LastEditTime: 2026-03-12 21:45:38
 */
import LiveLogs from "./LiveLogs";

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Live Logs</h1>
      <LiveLogs />
    </div>
  );
}
