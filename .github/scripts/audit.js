/*
 * @FilePath: \my-new-app\.github\scripts\audit.js
 * @LastEditTime: 2026-08-18 21:09:23
 */
import fs from "fs";
import * as yaml from "js-yaml";
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
console.log("ORG ID:", process.env.AXIOM_ORG_ID);

// -----------------------------
// Axiom client
// -----------------------------
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
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
const IGNORE = [
  // "1145093",   
];



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
// advisories is an object: { pkgName: [advisoryObjects...] }
const allAdvisories = [];
for (const [pkg, items] of Object.entries(advisories)) {
  for (const adv of items) {
    allAdvisories.push({
      pkg,
      ...adv,
    });
  }
}

// Build a set of ALL advisory IDs (before filtering)
const allIds = new Set(allAdvisories.map(a => String(a.id)));

// Determine stale ignore entries
const staleIgnores = IGNORE.filter(id => !allIds.has(String(id)));
const validIgnores = IGNORE.filter(id => allIds.has(String(id)));
console.log(`You have ${validIgnores.length} active ignore entries.`);
  
  if (staleIgnores.length > 0) {
  console.log("Stale ignore entries detected:");
  staleIgnores.forEach(id => console.log("  -", id));
} else {
  // console.log("No stale ignore entries.");
}

// Use only valid ignore entries going forward
const prunedIgnoreList = validIgnores;

// Now build realFindings using prunedIgnoreList
const realFindings = [];

for (const [pkg, items] of Object.entries(advisories)) {
  // Find the snapshot key for this package (pnpm v9)
  const snapshotKey = Object.keys(deps).find(k => k.startsWith(pkg + "@"));
  if (!snapshotKey) continue;

  const snapshot = deps[snapshotKey];
  const installed = snapshot.version; // ✔ correct installed version

  for (const adv of items) {
    const vulnerableRange = adv.vulnerable_versions;

    // ✔ skip ignored advisories
    if (prunedIgnoreList.includes(String(adv.id))) {
      continue;
    }

    // ✔ OPTIONAL: skip dev-only dependencies
    // If you want nanoid to show up, REMOVE this check.
    const isDev = snapshot.dev === true;
    if (isDev) {
      // continue;  // ❌ remove this if you want nanoid flagged
    }

    // ✔ semver check using correct installed version
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
if (realFindings.length > 0) {
  console.log(`Found ${realFindings.length} active vulnerabilities:`);
  for (const f of realFindings) {
    console.log(
      `- ${f.pkg}@${f.installed} (${f.severity}) — ${f.title} [${f.id}]`
    );
  }
} else {
  console.log("No active vulnerabilities found.");
}