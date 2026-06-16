// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default defineConfig([

  // 1. Node scripts (no React rules)
  {
    files: ["**/*.js", "**/*.cjs", ".github/scripts/**/*.js"],
    ignores: ["app/**", "components/**"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: "latest",
    },
    rules: {
      // Disable React rules that crash on ESLint 10
      "react/display-name": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-render-return-value": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
    },
  },

  // 2. Next.js + TypeScript (React rules apply here)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    extends: [
      ...next,
      "plugin:@typescript-eslint/recommended",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },

  // 3. Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
