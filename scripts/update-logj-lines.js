import fs from "fs";
import path from "path";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node update-logj-lines.js <file>");
  process.exit(1);
}

const workspaceRoot = process.cwd();
const relativeFilePath = path.relative(workspaceRoot, filePath);

const lines = fs.readFileSync(filePath, "utf8").split("\n");

let fileUpdates = 0;
let lineUpdates = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect the start of a logj block
  if (line.includes("logj({")) {
    const correctLineNumber = i + 1;

    // Now scan forward until we hit the closing });
    for (let j = i; j < lines.length; j++) {
      let inner = lines[j];

      // Update file:
      if (inner.includes("file:")) {
        inner = inner.replace(
          /file:\s*["'][^"']*["']/,
          `file: "${relativeFilePath}"`,
        );
        lines[j] = inner;
        fileUpdates++;
      }

      // Update line:
      if (inner.includes("line:")) {
        inner = inner.replace(/line:\s*\d+/, `line: ${correctLineNumber}`);
        lines[j] = inner;
        lineUpdates++;
      }

      // End of block
      if (inner.includes("});")) break;
    }
  }
}

fs.writeFileSync(filePath, lines.join("\n"));

console.log(
  `Updated file: ${fileUpdates} times, line: ${lineUpdates} times in ${relativeFilePath}`,
);
