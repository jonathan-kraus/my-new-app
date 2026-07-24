// app\api\logview\route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

// GET /api/logview
// Query params:
//   level    - filter by level (error|warn|info|debug)
//   domain   - filter by domain
//   search   - full-text search across message, requestId, sessionEmail, sessionUser
//   window   - time window (1h|24h|7d|30d|all), default: 24h
//   limit    - max rows, default 100, max 1000
//   offset   - pagination offset, default: 0

const ALLOWED_WINDOWS: Record<string, string | null> = {
  "1h": "NOW() - INTERVAL '1 hour'",
  "24h": "NOW() - INTERVAL '24 hours'",
  "7d": "NOW() - INTERVAL '7 days'",
  "30d": "NOW() - INTERVAL '30 days'",
  all: null,
};

interface CountRow {
  total: number;
}
interface DomainRow {
  domain: string;
  count: number;
}
interface LevelRow {
  level: string;
  count: number;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const level = url.searchParams.get("level") || null;
  const domain = url.searchParams.get("domain") || null;
  const search = url.searchParams.get("search") || null;
  const window_ = url.searchParams.get("window") || "24h";
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "100"),
    1000,
  );
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 },
    );
  }

  // Pool.query() accepts plain strings + positional $1..$N params,
  // unlike neon() which only accepts tagged template literals.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const conditions: string[] = [];
  const baseValues: unknown[] = [];
  let p = 1;

  if (level && ["error", "warn", "info", "debug"].includes(level)) {
    conditions.push(`level = $${p++}`);
    baseValues.push(level);
  }

  if (domain) {
    conditions.push(`domain = $${p++}`);
    baseValues.push(domain);
  }

  if (search) {
    // same placeholder index repeated — Postgres allows this
    conditions.push(
      `(message ILIKE $${p} OR "requestId" ILIKE $${p} OR "sessionEmail" ILIKE $${p} OR "sessionUser" ILIKE $${p} OR "userId" ILIKE $${p})`,
    );
    baseValues.push(`%${search}%`);
    p++;
  }

  const cutoff = ALLOWED_WINDOWS[window_] ?? null;
  if (cutoff) {
    // safe: value comes from our allow-list above, never from user input
    conditions.push(`created_at > ${cutoff}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Sidebar queries exclude the domain filter so counts reflect all domains
  const domainIdx = domain ? baseValues.indexOf(domain) : -1;
  const sidebarValues =
    domainIdx >= 0
      ? [...baseValues.slice(0, domainIdx), ...baseValues.slice(domainIdx + 1)]
      : [...baseValues];
  const sidebarConditions = conditions.filter((c) => !c.startsWith("domain"));
  const sidebarWhere = sidebarConditions.length
    ? `WHERE ${sidebarConditions.join(" AND ")}`
    : "";

  const logsQuery = `
    SELECT
      id, level, message, "requestId", domain,
      payload, meta, "userId", "sessionEmail", "sessionUser",
      file, line, created_at
    FROM "Log"
    ${where}
    ORDER BY created_at DESC
    LIMIT $${p} OFFSET $${p + 1}
  `;
  const logsValues = [...baseValues, limit, offset];
  const countQuery = `SELECT COUNT(*)::int AS total FROM "Log" ${where}`;
  const domainQuery = `SELECT domain, COUNT(*)::int AS count FROM "Log" ${sidebarWhere} GROUP BY domain ORDER BY count DESC`;
  const levelQuery = `SELECT level, COUNT(*)::int AS count FROM "Log" ${sidebarWhere} GROUP BY level`;
  const last10Where = sidebarWhere
    ? `${sidebarWhere} AND created_at > NOW() - INTERVAL '10 minutes'`
    : `WHERE created_at > NOW() - INTERVAL '10 minutes'`;
  const last10Query = `SELECT COUNT(*)::int AS total FROM "Log" ${last10Where}`;

  try {
    const [logsRes, countRes, domainRes, levelRes, last10Res] =
      await Promise.all([
        pool.query(logsQuery, logsValues),
        pool.query<CountRow>(countQuery, baseValues),
        pool.query<DomainRow>(domainQuery, sidebarValues),
        pool.query<LevelRow>(levelQuery, sidebarValues),
        pool.query<CountRow>(last10Query, sidebarValues),
      ]);

    return NextResponse.json({
      logs: logsRes.rows,
      total: countRes.rows[0]?.total ?? 0,
      domains: domainRes.rows,
      levels: levelRes.rows,
      last10: last10Res.rows[0]?.total ?? 0,
      limit,
      offset,
    });
  } catch (err: unknown) {
    console.error("[logview] query error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
