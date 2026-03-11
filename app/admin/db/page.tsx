// app\admin\db\page.tsx
import { getOverview, getHistory } from "@/lib/db/overview";
import { DbDashboard } from "@/components/db-dashboard";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tables, history] = await Promise.all([getOverview(), getHistory()]);

  await logit("jonathan", {
        level: "info",
        message: "Fetched DB overview and history",
      }, { eventIndex }, {
          page: "/admin/db", file: "page.tsx", method: "GET", url: "/admin/db", requestId: crypto.randomUUID(), tablesCount: tables.length, historyCount: history.length, userId: "JK",
          requestId: ctx?.requestId ?? req?.id,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        });
  return <DbDashboard tables={tables} history={history} />;
}
