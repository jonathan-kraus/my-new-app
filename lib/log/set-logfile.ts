/*
 * @FilePath: \my-new-app\lib\log\set-logfile.ts
 * @LastEditTime: 2026-03-20 04:40:50
 */
// lib/log/set-logfile.ts
export function setLogFile(path: string) {
  (globalThis as any).__logfile = path;
}
