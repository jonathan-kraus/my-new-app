// app\admin\db\page.tsx

import { DbDashboard } from "@/components/db-dashboard";
import { getHistory, getOverview } from "@/lib/db/overview";
import { staticUniversalContext } from "@/lib/log/buildj";
import { logj } from "@/lib/log/logj";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tables, history] = await Promise.all([getOverview(), getHistory()]);
  const built = await staticUniversalContext("DB");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "Fetched DB overview and history",
    file: "app/admin/db/page.tsx",
    line: 12,
    payload: { tablesCount: tables.length, historyCount: history.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return <DbDashboard tables={tables} history={history} />;
}
