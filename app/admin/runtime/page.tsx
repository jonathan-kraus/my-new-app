import { db } from "@/lib/db";
import ConfigTable from "./ConfigTable";

export default async function RuntimeAdminPage() {
  const configs = await db.runtimeConfig.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Runtime Config</h1>

      <ConfigTable configs={configs} />
    </div>
  );
}
