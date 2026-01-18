// lib\log\logWithFile.ts Creation Date: 2026-01-17 12:12:03
import { withFile } from "./withFile";
import { logit } from "./server";
export function logWithFile(file: string, data: any) {
  return logit({ ...data, file: withFile(file) });
}
