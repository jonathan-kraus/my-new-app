// lib/log/caller.ts

export function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split("\n") ?? [];

  // Stack format:
  // Error
  //   at logit (/path/to/file:line:column)
  //   at caller (/path/to/caller:line:column)

  const callerLine = stack[3] ?? ""; // index 3 = the caller of logit()

  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
  if (!match) return { file: null, line: null };

  const [, file, line] = match;
  return { file, line: Number(line) };
}
