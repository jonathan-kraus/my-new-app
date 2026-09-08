import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/auth": path.resolve(import.meta.dirname, "auth.ts"), // put this FIRST
      "@": path.resolve(import.meta.dirname, "src"),
      "@/components": path.resolve(import.meta.dirname, "app/components"),
      "@/hooks": path.resolve(import.meta.dirname, "hooks"),
      "@/lib": path.resolve(import.meta.dirname, "src/lib"),
      "@/types": path.resolve(import.meta.dirname, "types"),
      "@/tests": path.resolve(import.meta.dirname, "tests"),
    },
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    environment: "node",

    include: [
      "app/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "app/**/__test__/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    exclude: ["tests/log/__mocks__/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: [
        "src/lib/axiom.ts",
        "src/lib/log/client.ts",
        "src/lib/runtime/config.ts",
        "src/lib/utils/global.ts",
      ],
      thresholds: {
        lines: 60,
        functions: 50,
        branches: 50,
        statements: 60,
      },
    },
  },
});
