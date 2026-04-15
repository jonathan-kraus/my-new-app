
import fs from "fs";
import yaml from "js-yaml";

const lock = yaml.load(fs.readFileSync("pnpm-lock.yaml", "utf8"));

const deps = lock.snapshots || {};
const payload = {};

for (const key of Object.keys(deps)) {
  // keys look like: "next@15.1.0" or "@auth/prisma-adapter@1.0.0(next@15.1.0)"
  // strip peer dep suffix in parens first
  const clean = key.replace(/\(.*\)$/, "");
  const atIndex = clean.lastIndexOf("@");
  if (atIndex <= 0) continue;
  const name = clean.slice(0, atIndex);
  const version = clean.slice(atIndex + 1);
  if (!name || !version) continue;
  payload[name] = [version];
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
