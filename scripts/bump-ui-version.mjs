/*
 * @FilePath: \my-new-app\scripts\bump-ui-version.mjs
 * @LastEditTime: 2026-03-09 20:24:45
 */
import { readFileSync, writeFileSync } from "fs";

const path = new URL("../version.json", import.meta.url);
const json = JSON.parse(readFileSync(path, "utf8"));
const [major, minor, patch] = json.version.split(".").map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

json.version = newVersion;
writeFileSync(path, JSON.stringify(json, null, 2) + "\n");

console.log(`Bumped UI version to ${newVersion}`);
