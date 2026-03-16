/*
 * @FilePath: \my-new-app\scripts\bump-ui-version.mjs
 * @LastEditTime: 2026-03-16 14:29:14
 */
import { readFileSync, writeFileSync } from "fs";

const path = new URL("../version.json", import.meta.url);
const json = JSON.parse(readFileSync(path, "utf8"));

let [major, minor, patch] = json.version.split(".").map(Number);

// bump patch
patch += 1;

// rollover patch at 90
if (patch >= 90) {
  patch = 0;
  minor += 1;
}

// rollover minor at 90
if (minor >= 90) {
  minor = 0;
  major += 1;
}

// always format as two digits for minor/patch
const fmt = (n) => String(n).padStart(2, "0");

const newVersion = `${fmt(major)}.${fmt(minor)}.${fmt(patch)}`;

json.version = newVersion;
writeFileSync(path, JSON.stringify(json, null, 2) + "\n");

console.log(`Bumped UI version to ${newVersion}`);
