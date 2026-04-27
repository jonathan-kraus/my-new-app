// app\admin\db\page.tsx
import { getOverview, getHistory } from "@/lib/db/overview";
import { DbDashboard } from "@/components/db-dashboard";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tables, history] = await Promise.all([getOverview(), getHistory()]);
  const built = await staticUniversalContext("DB");
  let jei = 0;
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Fetched DB overview and history",
    file: "app/admin/db/page.tsx",
    line: 12,
    payload: { tablesCount: tables.length, historyCount: history.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  return <DbDashboard tables={tables} history={history} />;
}
