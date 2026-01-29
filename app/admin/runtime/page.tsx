import { db } from "@/lib/db";
import { ConfigTable } from "./ConfigTable";
import { EmailThrottleCountdown } from "./EmailThrottleCountdown";
export default async function RuntimeAdminPage() {
  const configs = await db.runtimeConfig.findMany({
    orderBy: { key: "asc" },
  });
  const lastSent =
    configs.find((c) => c.key === "email.last_sent_at")?.value ?? null;
  const throttle = Number(
    configs.find((c) => c.key === "email.throttle.minutes")?.value ?? "0",
  );

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-white">Runtime Controls</h1>
      <EmailThrottleCountdown lastSent={lastSent} throttleMinutes={throttle} />

      <p className="text-white/60">Live feature flags & runtime settings</p>

      <ConfigTable configs={configs} />
    </div>
  );
}
