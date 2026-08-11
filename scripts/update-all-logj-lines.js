/*
 * @FilePath: \my-new-app\scripts\update-all-logj-lines.js
 * @LastEditTime: 2026-08-11 19:50:07
 */
import fs from "fs";
import path from "path";

const workspaceRoot = process.cwd();

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

function updateFile(filePath) {
  const relative = normalizePath(path.relative(workspaceRoot, filePath));
  const lines = fs.readFileSync(filePath, "utf8").split("\n");

  let fileUpdates = 0;
  let lineUpdates = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("logj({")) {
      const correctLineNumber = i + 1;

      for (let j = i; j < lines.length; j++) {
        let inner = lines[j];

        if (inner.includes("file:")) {
          inner = inner.replace(
            /file:\s*["'][^"']*["']/,
            `file: "${relative}"`,
          );
          lines[j] = inner;
          fileUpdates++;
        }

        if (inner.includes("line:")) {
          inner = inner.replace(/line:\s*\d+/, `line: ${correctLineNumber}`);
          lines[j] = inner;
          lineUpdates++;
        }

        if (inner.includes("});")) break;
      }
    }
  }

  if (fileUpdates || lineUpdates) {
    fs.writeFileSync(filePath, lines.join("\n"));
  }

  return { fileUpdates, lineUpdates };
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      const result = updateFile(fullPath);
      if (result.fileUpdates || result.lineUpdates) {
        console.log(
          `${normalizePath(path.relative(workspaceRoot, fullPath))} → file:${result.fileUpdates}, line:${result.lineUpdates}`,
        );
      }
    }
  }
}

walk(workspaceRoot);

console.log("Finished updating all logj entries.");
