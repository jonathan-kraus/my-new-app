"use server";
import { staticUniversalContext } from "@/lib/log/buildj";
// app/actions/log.ts
import { logj } from "@/lib/log/logj";

export async function logFromClient(
  domain: string,
  message: string,
  file: string,
  line: number,
  payload: unknown,
) {
  const built = await staticUniversalContext(domain);
  let jei = 0;
  return await logj({
    domain: domain,
    level: "info",
    message: message,
    file: file,
    line: line,
    payload: { payload },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
}
