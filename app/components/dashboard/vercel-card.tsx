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
      <h2 className="font-semibold mb-3">Recent Vercel Deployments</h2>

      <ul className="space-y-3">
        {deployments.slice(0, 5).map((d) => {
          const created = new Date(d.createdAt).toLocaleString();
          const sha = d.meta.githubCommitSha?.slice(0, 7) ?? "unknown";

          return (
            <li
              key={d.uid}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-white">
                    {d.meta.githubCommitMessage ?? "No commit message"}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">SHA: {sha}</div>

                  <div className="text-xs text-gray-400 mt-1">
                    State:{" "}
                    <span
                      className={
                        d.state === "READY" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {d.state}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Created: {created}
                  </div>
                </div>

                <a
                  href={`https://${d.url}`}
                  target="_blank"
                  className="text-blue-400 text-xs underline"
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
