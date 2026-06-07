// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([

  // 1. Node scripts (NO React rules)
  {
    files: [".github/scripts/**/*.js"],
    languageOptions: {
      sourceType: "script",
    },
    rules: {
      // Disable ALL React rules that crash on ESLint 10
      "react/display-name": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-render-return-value": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
    },
  },

  // 2. Next.js + TypeScript (React rules apply here)
  ...nextVitals,
  ...nextTs,

  // 3. Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

