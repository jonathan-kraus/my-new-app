/*
 * @FilePath: \my-new-app\.github\actions\coverage-summary\write-summary.mjs
 * @LastEditTime: 2026-09-27 19:57:06
 */
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const workspacePath = process.env.GITHUB_WORKSPACE;

if (!summaryPath) {
  throw new Error('GITHUB_STEP_SUMMARY is required.');
}

if (!workspacePath) {
  throw new Error('GITHUB_WORKSPACE is required.');
}

const versionPath = path.join(workspacePath, 'version.json');
const coveragePath = path.join(
  workspacePath,
  'coverage',
  'coverage-summary.json',
);

let version = 'unknown';
let coverage = null;

try {
  const versionFile = await readFile(versionPath, 'utf8');
  const parsedVersion = JSON.parse(versionFile);

  if (typeof parsedVersion.version === 'string' && parsedVersion.version.trim()) {
    version = parsedVersion.version.trim();
  }
} catch {
  console.warn(`Could not read ${versionPath}; using "unknown".`);
}

try {
  const coverageFile = await readFile(coveragePath, 'utf8');
  const parsedCoverage = JSON.parse(coverageFile);

  const total = parsedCoverage.total;

  if (
    total &&
    typeof total.statements?.pct === 'number' &&
    typeof total.branches?.pct === 'number' &&
    typeof total.functions?.pct === 'number' &&
    typeof total.lines?.pct === 'number'
  ) {
    coverage = total;
  } else {
    console.warn(`Coverage data in ${coveragePath} has an unexpected shape.`);
  }
} catch {
  console.warn(`Could not read ${coveragePath}; coverage will be omitted.`);
}

const lines = [
  '## CI Summary',
  '',
  `- Current app version: **${version}**`,
  '',
  '### Coverage',
];

if (coverage) {
  lines.push(
    '',
    '| Metric | Coverage |',
    '| --- | ---: |',
    `| Statements | ${coverage.statements.pct}% |`,
    `| Branches | ${coverage.branches.pct}% |`,
    `| Functions | ${coverage.functions.pct}% |`,
    `| Lines | ${coverage.lines.pct}% |`,
  );
} else {
  lines.push('', '- Coverage summary not found ⚠️');
}

lines.push('', '- Job summary was written by Node.js ✅', '');

await appendFile(summaryPath, lines.join('\n'), 'utf8');
