/*
 * @FilePath: \my-new-app\lib\db\safe.ts
 * @LastEditTime: 2026-05-10 20:32:59
 */

export function assertRows<T>(
  rows: T[] | undefined | null,
  context?: string,
): T[] {
  if (!rows || rows.length === 0) {
    throw new Error(
      context ? `Query returned no rows: ${context}` : "Query returned no rows",
    );
  }
  return rows;
}

export function firstRow<T>(rows: T[] | undefined | null, context?: string): T {
  if (!rows || rows.length === 0) {
    throw new Error(
      context ? `Query returned no rows: ${context}` : "Query returned no rows",
    );
  }

  // This cast is safe because we just validated length > 0
  return rows[0] as T;
}

export function assertNonEmptyArray<T>(
  value: T[] | undefined | null,
  context?: string,
): [T, ...T[]] {
  if (!value || value.length === 0) {
    throw new Error(
      context
        ? `Expected non-empty array: ${context}`
        : "Expected non-empty array",
    );
  }

  // This cast is safe because we validated length > 0
  return value as [T, ...T[]];
}
