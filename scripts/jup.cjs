#!/usr/bin/env node

const { execSync } = require("node:child_process");

const pkg = process.argv[2];

if (!pkg) {
  console.error("Usage: jup <package-name>");
  process.exit(1);
}

execSync(`pnpm update ${pkg}@latest`, { stdio: "inherit" });
