// lib\log\withFile.ts Creation Date: 2026-01-17 12:18:05
export function withFile(file: string) {
  return file.replace(/\\/g, "/").replace(process.cwd(), "");
}
