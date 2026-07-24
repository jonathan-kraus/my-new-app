// eslint.config.mjs
import tsParser from "@typescript-eslint/parser";
import next from "eslint-config-next";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // 1. Ignore build artifacts
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

  // 2. Next.js recommended + core-web-vitals
  ...next,

  // 3. Strict TypeScript linting
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
      unusedImports,
    },
    rules: {
      // Strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Import rules
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",

      // Remove unused imports automatically
      "unused-imports/no-unused-imports": "error",

      // Next.js rules
      "next/no-html-link-for-pages": "off",
    },
  },

  // 4. JS-only files (scripts, GitHub actions)
  {
    files: ["**/*.js", "**/*.cjs", ".github/scripts/**/*.js"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: "latest",
    },
  },

  // 5. Allow anonymous default export in eslint config
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];
