"use server";
// app/actions/log.ts
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

export async function logFromClient(
  domain: string,
  message: string,
  file: string,
  line: number,
  payload: any,
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
