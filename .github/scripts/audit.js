/*
 * @FilePath: \my-new-app\.github\scripts\audit.js
 * @LastEditTime: 2026-04-17 12:59:08
 */
import fs from "fs";
import yaml from "js-yaml";
import semver from "semver";
import { Axiom } from "@axiomhq/js";

// -----------------------------
// Axiom client
// -----------------------------
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
});

const DATASET = process.env.AXIOM_DATASET;

// -----------------------------
// Load pnpm lockfile
// -----------------------------
const lock = yaml.load(fs.readFileSync("pnpm-lock.yaml", "utf8"));
const deps = lock.snapshots || {};
const payload = {};

for (const key of Object.keys(deps)) {
  const clean = key.replace(/\(.*\)$/, "");
  const atIndex = clean.lastIndexOf("@");
  if (atIndex <= 0) continue;

  const name = clean.slice(0, atIndex);
  const version = clean.slice(atIndex + 1);
  if (!name || !version) continue;

  payload[name] = [version];
}

console.log("🔍 Auditing", Object.keys(payload).length, "packages…");

// -----------------------------
// Bulk Advisory API
// -----------------------------
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
  await axiom.ingest(DATASET, {
    domain: "audit",
    level: "error",
    message: "Audit API error",
    status: res.status,
    packages_checked: Object.keys(payload).length,
  });
  process.exit(1);
}

const advisories = await res.json();

// -----------------------------
// Filter advisories by semver
// -----------------------------
const realFindings = [];

for (const [pkg, items] of Object.entries(advisories)) {
  const installed = payload[pkg][0];

  for (const adv of items) {
    const vulnerableRange = adv.vulnerable_versions;

    if (semver.satisfies(installed, vulnerableRange)) {
      realFindings.push({
        pkg,
        installed,
        title: adv.title,
        severity: adv.severity,
        vulnerableRange,
      });
    }
  }
}
const built = true;

// -----------------------------
// Log to Axiom
// -----------------------------
await axiom.ingest(DATASET, {
  domain: "audit",
  level: realFindings.length === 0 ? "info" : "warn",
  message: "Dependency audit completed",
  packages_checked: Object.keys(payload).length,
  vulnerabilities_count: realFindings.length,
  vulnerabilities_json: JSON.stringify(realFindings),
  ci_run_id: process.env.GITHUB_RUN_ID,
  meta_json: JSON.stringify({ built }),
});

// -----------------------------
// Output + exit code
// -----------------------------
if (realFindings.length === 0) {
  console.log("✅ No vulnerabilities found");
  process.exit(0);
}

console.log("⚠️ Vulnerabilities detected:");
for (const f of realFindings) {
  console.log(
    `- ${f.pkg}@${f.installed} is within ${f.vulnerableRange}: ${f.title} (severity: ${f.severity})`
  );
}

process.exit(1);
