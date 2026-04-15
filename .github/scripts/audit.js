/*
 * @FilePath: \my-new-app\.github\scripts\audit.js
 * @LastEditTime: 2026-04-15 16:21:40
 */
#!/usr/bin/env node

import fs from "fs";
import fetch from "node-fetch";

const lock = JSON.parse(fs.readFileSync("pnpm-lock.yaml", "utf8")
  .replace(/^\s*#.*$/gm, "") // strip comments
  .replace(/:$/gm, ": null") // YAML edge cases
);

const deps = lock.packages || {};
const payload = {};

for (const [key, pkg] of Object.entries(deps)) {
  if (!pkg.version) continue;
  const name = key.replace(/^node_modules\//, "");
  payload[name] = [pkg.version];
}

console.log("🔍 Auditing", Object.keys(payload).length, "packages…");

const res = await fetch(
  "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }
);

if (!res.ok) {
  console.error("❌ Audit API error:", res.status, await res.text());
  process.exit(1);
}

const advisories = await res.json();
const keys = Object.keys(advisories);

if (keys.length === 0) {
  console.log("✅ No vulnerabilities found");
  process.exit(0);
}

console.log("⚠️ Vulnerabilities detected:");
for (const [pkg, items] of Object.entries(advisories)) {
  for (const adv of items) {
    console.log(`- ${pkg}: ${adv.title} (severity: ${adv.severity})`);
  }
}

process.exit(1);
