export const dynamic = "force-dynamic";

import { getVercelDeployments } from "./vercel";
import { getRecentActivity } from "./github";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

export interface VercelDeploymentsResponse {
  deployments: any[];
  pagination: any;
}
/**
 * Convert a Date → ISO string, or return null if invalid.
 */
function safeDate(value: any): string | null {
  if (!(value instanceof Date)) return null;
  return isNaN(value.getTime()) ? null : value.toISOString();
}

/**
 * Convert anything that looks like a date string → ISO string.
 */
function safeDateString(value: any): string | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Recursively sanitize the entire snapshot.
 * - Converts Date objects → ISO strings
 * - Converts invalid Dates → null
 * - Converts date-like strings → ISO strings
 * - Leaves all other primitives untouched
 * - Recurses through objects and arrays
 */
export function sanitizeSnapshot(input: any): any {
  if (input === null || input === undefined) return input;

  // Handle Date objects
  if (input instanceof Date) {
    return safeDate(input);
  }

  // Handle strings that might be dates
  if (typeof input === "string") {
    const iso = safeDateString(input);
    return iso ?? input; // keep original string if not a date
  }

  // Handle arrays
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeSnapshot(item));
  }

  // Handle objects
  if (typeof input === "object") {
    const out: Record<string, any> = {};

    for (const key of Object.keys(input)) {
      const value = input[key];

      // Special case: dateObj fields
      if (key === "dateObj") {
        if (value instanceof Date) {
          out[key] = safeDate(value);
        } else if (typeof value === "string") {
          out[key] = safeDateString(value);
        } else {
          out[key] = null;
        }
        continue;
      }

      // Recurse normally
      out[key] = sanitizeSnapshot(value);
    }

    return out;
  }

  // Primitive (number, boolean, etc.)
  return input;
}

export interface DashboardData {
  vercel: VercelDeploymentsResponse | null;
  github: any[] | null;
  astronomy: any | null;
  system: { generatedAt: string };
}
const built = staticUniversalContext("Dashboard");
let jei = 0;
export async function logDashboardAstronomy(snapshot: unknown) {
  const safePayload = {
  ...snapshot,
  snapshot: sanitizeSnapshot(snapshot),
};
  await logj({
    domain: "DashboardAstronomy",
    level: "info",
    message: "Dashboard Astronomy snapshot",
    file: "dashboard.ts",
    line: 24,
    payload: { some: "data1", snapshot },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [vercelResult, githubResult, astronomyResult] = await Promise.all([
    safe<VercelDeploymentsResponse>(() => getVercelDeployments()),
    safe(() => getRecentActivity("jonathan-kraus")),
    safe(() => getEphemerisSnapshot("KOP")),
  ]);

  const vercel = vercelResult.ok ? vercelResult.data : null;

  await logj({
    domain: "vercel",
    level: "info",
    message: "Dashboard Vercel deployments initial call",
    file: "dashboard.ts",
    line: 46,
    payload: {
      vercelResultOk: vercelResult.ok,
      vercelRaw: vercel,
      vercelError: vercelResult.ok ? null : String(vercelResult.error),
      vercelCount: Array.isArray(vercel?.deployments)
        ? vercel.deployments.length
        : "not-array",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("VERCEL_TOKEN suffix", process.env.VERCEL_TOKEN?.slice(-6));
  console.log("dashboard vercelResult.ok", vercelResult.ok);
  console.log("dashboard vercel raw", JSON.stringify(vercel, null, 2));
  console.log(
    "dashboard vercel count",
    Array.isArray(vercel?.deployments)
      ? vercel.deployments.length
      : "not-array",
  );

  const github = githubResult.ok ? githubResult.data : [];
  const astronomy = astronomyResult.ok
    ? (astronomyResult.data.snapshot ?? null)
    : null;

  if (astronomy) {
    await logDashboardAstronomy(astronomy);
  }

  return {
    vercel,
    github,
    astronomy,
    system: {
      generatedAt: new Date().toISOString(),
    },
  };
}

export type SafeResult<T> =
  { ok: true; data: T } | { ok: false; error: unknown };

export async function safe<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return { ok: false, error };
  }
}
