// app/dashboard/db-tables/page.tsx
import { DbGrowthChart } from "@/components/db/DbGrowthChart";
import { DbDeltaBadge } from "@/components/db/DbDeltaBadge";
import { getServerBaseUrl } from "@/lib/serverBaseUrl";

type Row = {
  tableName: string;
  snapshotDate: string;
  totalBytes: string;
  deltaBytes: number | null;
};

export default async function Page() {
  const baseUrl = await getServerBaseUrl();

  const res = await fetch(`${baseUrl}/api/db-stats/history`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load db stats");
  }

  const rows: Row[] = await res.json();

  // Group rows by table
  const byTable = rows.reduce<Record<string, Row[]>>((acc, row) => {
    acc[row.tableName] ??= [];
    acc[row.tableName].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Database Table Growth</h1>

      {Object.entries(byTable).map(([tableName, history]) => {
        const sorted = history.sort(
          (a, b) =>
            new Date(a.snapshotDate).getTime() -
            new Date(b.snapshotDate).getTime(),
        );

        const latest = sorted.at(-1);

        return (
          <div key={tableName} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{tableName}</h2>
              <DbDeltaBadge delta={latest?.deltaBytes ?? null} />
            </div>

            <DbGrowthChart
              data={sorted.map((r) => ({
                date: r.snapshotDate,
                value: Number(r.totalBytes),
              }))}
            />
          </div>
        );
      })}
    </div>
  );
}
