/*
 * @FilePath: \my-new-app\src\lib\timestampString.ts
 * @LastEditTime: 2026-09-17 23:26:35
 */
export const timestampString = (value: string) =>
  value as `${string}` & { readonly __timestampStringPrecision: 3 };

export const varchar10 = (value: string) =>
  value as string & { readonly __varcharLength: 10 };
