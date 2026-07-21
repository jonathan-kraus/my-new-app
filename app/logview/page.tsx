import { db } from "@/lib/db";
import LogViewerClient from "./LogViewerClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await db.log.count({
    where: {
      created_at: {
        gte: tenMinutesAgo,
      },
    },
  });

  return {
    title: `Logview — ${recentCount} in last 10m`,
  };
}

export default function LogViewerPage() {
  return <LogViewerClient />;
}
