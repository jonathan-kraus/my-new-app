import { getFormattedVercelUsage } from "@/lib/vercel";

// app/components/dashboard/vercel-card.tsx
type Props = {
  data: Awaited<ReturnType<typeof getFormattedVercelUsage>>;
};

export function VercelCard({ data }: Props) {
  if (!data.ok || !data.usage) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded">
        Vercel API error: {data.error}
      </div>
    );
  }

  const u = data.usage;

  return (
    <div className="p-4 bg-zinc-900 rounded">
      <h2 className="font-semibold mb-2">Vercel Usage</h2>
      <p>Bandwidth: {u.bandwidth} MB</p>
      <p>Serverless Invocations: {u.serverlessInvocations}</p>
      <p>
        Period: {u.periodStart} → {u.periodEnd}
      </p>
    </div>
  );
}
