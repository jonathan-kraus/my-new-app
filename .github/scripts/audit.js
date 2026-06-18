/*
 * @FilePath: \my-new-app\.github\scripts\audit.js
 * @LastEditTime: 2026-06-18 14:02:37
 */
import fs from "fs";
import yaml from "js-yaml";
import semver from "semver";
import { Axiom } from "@axiomhq/js";
import { config } from "dotenv";

// Add this BEFORE dotenv
console.log("PRE-DOTENV TOKEN:", !!process.env.AXIOM_TOKEN);
console.log("PRE-DOTENV CI:", process.env.CI);
// Only load .env.local if NOT in CI
if (!process.env.CI) {
  config({ path: ".env.local" });
}

console.log("TOKEN exists:", !!process.env.AXIOM_TOKEN);
console.log("DATASET:", process.env.AXIOM_DATASET);

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
const file = fs.readFileSync("pnpm-lock.yaml", "utf8");
const docs = yaml.loadAll(file);
const lock = docs[0]; // pnpm v9+ stores the main lockfile here
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

console.log("🔍 -- Auditing", Object.keys(payload).length, "packages…");

// advisories to ignore by ID
const IGNORE = ["1121191"];


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

  try {
    await axiom.ingest(DATASET, {
      domain: "audit",
      level: "error",
      message: "Audit API error",
      status: res.status,
      packages_checked: Object.keys(payload).length,
    });
    await axiom.flush();
    await axiom.close(); // <-- critical for Windows
  } catch (err) {
    console.error("❌ Axiom logging failed:", err.message);
  }

  throw new Error("Audit API error"); // <-- CI still fails, no libuv crash
}


const advisories = await res.json();

// -----------------------------
// Filter advisories by semver + IGNORE
// -----------------------------
const realFindings = [];

for (const [pkg, items] of Object.entries(advisories)) {
  const installed = payload[pkg][0];

  for (const adv of items) {
    const vulnerableRange = adv.vulnerable_versions;

    // skip ignored advisories
    if (IGNORE.includes(adv.id)) {
      continue;
    }

// skip ignored advisories
if (IGNORE.includes(String(adv.id))) {
  continue;
}

if (semver.satisfies(installed, vulnerableRange)) {
  realFindings.push({
    pkg,
    installed,
    title: adv.title,
    severity: adv.severity,
    vulnerableRange,
    id: adv.id,
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
  line: 106,
  file: "audit.js",
  packages_checked: Object.keys(payload).length,
  vulnerabilities_count: realFindings.length,
  vulnerabilities_json: JSON.stringify(realFindings),
  ci_run_id: process.env.GITHUB_RUN_ID,
  meta_json: JSON.stringify({ built }),
});

// -----------------------------
// Output + exit code (wrapped to avoid top-level return)
// -----------------------------
(async () => {
  if (realFindings.length === 0) {
    console.log("✅ No vulnerabilities found");
    try {
      await axiom.flush();
      console.log("✅ Axiom flush successful");
    } catch (err) {
      console.error("❌ Axiom flush failed:", err.message);
    }
    // success: let Node exit naturally
    return;
  }

  console.log("⚠️ Vulnerabilities detected:");
  for (const f of realFindings) {
    console.log(
      `- ${f.pkg}@${f.installed} is within ${f.vulnerableRange}: ${f.title} (severity: ${f.severity}, id: ${f.id})`
    );
  }

  try {
    await axiom.flush();
  } catch (err) {
    console.error("❌ Axiom flush failed:", err.message);
  }

  // signal failure to CI without throwing or exiting abruptly
  process.exitCode = 1;
})();
