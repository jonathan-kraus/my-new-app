/*
 * @FilePath: \my-new-app\app\logview\getLogs.tsx
 * @LastEditTime: 2026-07-20 23:52:05
 */
// app/logview/getLogs.ts
import { db } from "@/lib/db";

export async function getLogs(params: {
  page: number;
  pageSize: number;
  domain?: string;
  level?: string;
}) {
  const { page, pageSize, domain, level } = params;

  const where: any = {};
  if (domain) where.domain = domain;
  if (level) where.level = level;

  const logs = await db.log.findMany({
    where,
    orderBy: { created_at: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
console.log("LOG COUNT:", logs.length);

  const total = await db.log.count({ where });

  const rawDomains = await db.log.groupBy({
    by: ["domain"],
    _count: { domain: true },
  });

  const rawLevels = await db.log.groupBy({
    by: ["level"],
    _count: { level: true },
  });

  const domains = rawDomains.map((d) => ({
    domain: d.domain,
    count: d._count.domain,
  }));

  const levels = rawLevels.map((l) => ({
    level: l.level,
    count: l._count.level,
  }));

  return {
    logs,
    total,
    domains,
    levels,
  };
}
