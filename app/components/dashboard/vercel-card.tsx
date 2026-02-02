// app/components/dashboard/vercel-card.tsx
type Deployment = {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  meta: {
    githubCommitMessage?: string;
    githubCommitSha?: string;
  };
};

type Props = {
  deployments: Deployment[];
};

export default function VercelCard({ deployments }: Props) {
  if (!deployments || deployments.length === 0) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded">
        No Vercel deployments found.
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900 rounded">
      <h2 className="text-lg font-semibold mb-3">Recent Vercel Deployments</h2>

      <ul className="space-y-3">
        {deployments.slice(0, 5).map((d) => {
          const created = new Date(d.createdAt).toLocaleString();
          const sha = d.meta.githubCommitSha?.slice(0, 7) ?? "unknown";

          return (
            <li
              key={d.uid}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-white">
                    {d.meta.githubCommitMessage ?? "No commit message"}
                  </div>

                  <div className="text-sm font-medium text-gray-300 tracking-wide">
                    SHA: <span className="font-mono">{sha}</span>
                  </div>

                  <div className="text-sm font-medium text-gray-300">
                    State:{" "}
                    <span
                      className={
                        d.state === "READY" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {d.state}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400">
                    Created: {created}
                  </div>
                </div>

                <a
                  href={`https://${d.url}`}
                  target="_blank"
                  className="text-sm font-medium text-blue-400 underline"
                >
                  View
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
