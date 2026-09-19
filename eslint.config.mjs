// eslint.config.mjs
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import tsParser from "@typescript-eslint/parser";
import next from "eslint-config-next";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "src/lib/generated/**",
      "lib/generated/**",
    ],
  },

  // Bridge legacy plugin context APIs removed in ESLint 10.
  ...fixupConfigRules(next),

  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      // Next's bundled Babel parser uses a scope manager incompatible with ESLint 10.
      parser: tsParser,
      parserOptions: { project: false },
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      // Moderate strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",

      // Import rules
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",

      // Next.js rules
      "next/no-html-link-for-pages": "off",
    },
  },

  {
    files: ["**/*.js", "**/*.cjs", ".github/scripts/**/*.js"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: "latest",
    },
  },

  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];
