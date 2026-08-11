/*
 * @FilePath: \my-new-app\scripts\update-logj-lines.js
 * @LastEditTime: 2026-08-11 18:44:44
 */
import fs from "fs";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node update-logj-lines.js <file>");
  process.exit(1);
}

const lines = fs.readFileSync(filePath, "utf8").split("\n");

const updated = lines.map((line, index) => {
  const lineNumber = index + 1;

  if (line.includes("logj({")) {
    if (line.includes("line:")) {
      return line.replace(/line:\s*\d+/, `line: ${lineNumber}`);
    }
    return line.replace("logj({", `logj({ line: ${lineNumber},`);
  }

  return line;
});

fs.writeFileSync(filePath, updated.join("\n"));
console.log("Updated logj line numbers in", filePath);
