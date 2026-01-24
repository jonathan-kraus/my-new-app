import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./app/components"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/types": path.resolve(__dirname, "./types")
    }
  },

  test: {
    globals: true,
    environment: "node",

    include: [
      "app/**/*.test.{ts,tsx}",
      "app/**/__test__/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}"
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
});
