// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([

  // 1. Disable React plugin globally BEFORE Next.js loads it
  {
    settings: {
      react: {
        version: "999.999.999", // disables eslint-plugin-react internally
      },
    },
    rules: {
      "react/display-name": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-render-return-value": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
    },
  },

  // 2. Load Next.js configs
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
