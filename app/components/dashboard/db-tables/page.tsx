/*
 * @FilePath     : \my-new-app\app\components\dashboard\db-tables\page.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-07 01:58:10
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-07 01:58:17
 */
// app/dashboard/db-tables/page.tsx
import { DbGrowthChart } from "@/components/db/DbGrowthChart";
import { DbDeltaBadge } from "@/components/db/DbDeltaBadge";

export default async function Page() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/db-stats/history?table=GithubEvent`,
    {
      cache: "no-store",
    },
  );
  const data = await res.json();

  const latest = data[data.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">DB Table Growth</h1>
        <DbDeltaBadge delta={latest.deltaRows} />
      </div>

      <DbGrowthChart data={data} />
    </div>
  );
}
