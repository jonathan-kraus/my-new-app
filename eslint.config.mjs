// eslint.config.mjs
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

  ...next,

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
      import: importPlugin,
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
