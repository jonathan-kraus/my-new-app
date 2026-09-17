import { db8 } from "@/lib/db.prisma8";
import LogViewerClient from "./LogViewerClient";

export const dynamic = "force-dynamic";
const timestampString = (value: string) =>
  value as `${string}` & { readonly __timestampStringPrecision: 3 };
export async function generateMetadata() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const { total: recentCount } = await db8.orm.public.Log.where((log) =>
    log.createdAt.gte(timestampString(tenMinutesAgo.toISOString())),
  ).aggregate((agg) => ({
    total: agg.count(),
  }));

  return {
    title: `Logview — ${recentCount} in last 10m`,
  };
}

export default function LogViewerPage() {
  return <LogViewerClient />;
}
