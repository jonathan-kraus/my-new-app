// eslint.config.mjs
import next from "eslint-config-next";

const ignores = [
  ".next/**",
  "out/**",
  "build/**",
  "dist/**",
  "node_modules/**",
  "next-env.d.ts",
  "coverage/**",
  "app/**",
  "components/**",
  "lib/generated/**",
];

export default [
  {
    ignores,
  },
  ...next,
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
