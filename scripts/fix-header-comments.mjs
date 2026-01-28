// scripts\fix-header-comments.mjs
import fs from "node:fs";
import path from "node:path";

const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (exts.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const lines = original.split("\n");

  let changed = false;

  for (let i = 0; i < Math.min(2, lines.length); i++) {
    const line = lines[i];

    if (line.trim().startsWith("//") && line.includes("\\")) {
      const fixed = line.replace(/\\/g, "/");
      if (fixed !== line) {
        lines[i] = fixed;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`✔ Fixed: ${filePath}`);
  }
}

const root = process.cwd();
const files = walk(root);

console.log(`Scanning ${files.length} files…`);

for (const file of files) {
  fixFile(file);
}

console.log("Done.");

process.exit(0);
