/*
 * @FilePath: \my-new-app\lib\normalizePath.ts
 * @LastEditTime: 2026-02-26 13:23:30
 */
export function normalizePath(url: string): {
  last: string;
  lastTwo: string; // normalized as "a/b" or just "a"
} {
  try {
    const u = new URL(url);

    // Split path into non-empty segments
    const parts = u.pathname.split("/").filter(Boolean);

    // Root case → return "base"
    if (parts.length === 0) {
      return {
        last: "base",
        lastTwo: "base",
      };
    }

    // Last segment
    const last = parts[parts.length - 1];

    // Last two segments (or one if only one exists)
    const lastTwo =
      parts.length >= 2
        ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
        : last;

    return { last, lastTwo };
  } catch {
    return { last: "base", lastTwo: "base" };
  }
}

export default normalizePath;
