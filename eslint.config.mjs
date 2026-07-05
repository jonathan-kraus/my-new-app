// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  ...next,
  {
    files: ["**/*.js", "**/*.cjs", ".github/scripts/**/*.js"],
    ignores: ["app/**", "components/**"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: "latest",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
