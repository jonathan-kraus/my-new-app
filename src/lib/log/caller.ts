// lib/log/caller.ts

function getCallerInfo() {
  const stack = new Error().stack?.split("\n") ?? [];

  for (const line of stack) {
    const cleaned = line.trim();

    // Skip internal Node frames
    if (cleaned.includes("node:internal")) continue;

    // Skip node_modules
    if (cleaned.includes("node_modules")) continue;

    // Skip logger internals
    if (cleaned.includes("lib/log/logger")) continue;
    if (cleaned.includes("lib/log/logit")) continue;
    if (cleaned.includes("lib/log/build-universal-context")) continue;

    // Extract file + line
    const match =
      cleaned.match(/\((.*):(\d+):(\d+)\)/) ??
      cleaned.match(/at (.*):(\d+):(\d+)/);

    if (match) {
      return {
        file: match[1],
        line: match[2],
      };
    }
  }

  return { file: null, line: null };
}
