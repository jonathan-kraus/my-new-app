import { db } from "@/lib/db";
import { ConfigTable } from "./ConfigTable";

export default async function RuntimeAdminPage() {
  const configs = await db.runtimeConfig.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-white">Runtime Controls</h1>
      <p className="text-white/60">Live feature flags & runtime settings</p>

      <ConfigTable configs={configs} />
    </div>
  );
}
