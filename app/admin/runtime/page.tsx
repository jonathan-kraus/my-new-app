import { db } from "@/lib/db";
import { RuntimeConfigClient } from "./RuntimeConfigClient";

export default async function RuntimeConfigPage() {
  const configs = await db.runtimeConfig.findMany({
    orderBy: { key: "asc" },
  });

  return <RuntimeConfigClient configs={configs} />;
}
