import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    environment: "node",

    include: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],

    // Silence noisy Next.js warnings
    onConsoleLog(log) {
      if (
        log.includes("ExperimentalWarning") ||
        log.includes("fetch is not defined")
      ) {
        return false;
      }
    },
  },
});
