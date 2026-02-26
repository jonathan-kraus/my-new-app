/*
 * @FilePath: \my-new-app\lib\normalizePath.ts
 * @LastEditTime: 2026-02-26 16:51:03
 */
export default function normalizePath(url: string): {
  last: string;
  lastTwo: string;
} {
  try {
    const u = new URL(url);

    // Remove empty segments caused by leading/trailing slashes
    const parts = u.pathname.split("/").filter(Boolean);

    // Root → return "base"
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
    // Malformed URL → treat as base
    return { last: "base", lastTwo: "base" };
  }
}
