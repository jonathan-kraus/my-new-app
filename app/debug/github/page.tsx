import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugGithubPage() {
  const events = await db.githubDebug.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50, // adjust as needed
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">GitHub Debug Events</h1>

      {events.length === 0 && (
        <p className="text-gray-400">No debug events recorded.</p>
      )}

      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Status:</span> {e.status}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Action:</span> {e.action}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Commit:</span> {e.commit}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">SHA:</span>{" "}
                  {e.sha?.slice(0, 8)}…
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Received:</span>{" "}
                  {new Date(e.receivedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Collapsible raw JSON */}
            <details className="mt-3">
              <summary className="cursor-pointer text-blue-400">
                Raw Payload
              </summary>
              <pre className="mt-2 text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
                {JSON.stringify(e.raw, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
