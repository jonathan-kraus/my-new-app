/*
 * @FilePath: \my-new-app\codemods\migrate-logit-3arg.js
 * @LastEditTime: 2026-03-10 22:51:04
 */
/**
 * Full migration for 3-argument logit() calls:
 *
 * From:
 *   logit(domain, { level, message, payload: { ... } }, meta)
 *
 * To:
 *   logit(domain, { level, message }, { ... }, meta)
 *
 * Generates a before/after report.
 */

const fs = require("fs");
const path = require("path");

const report = [];

const IGNORED_DIRS = [
  "node_modules",
  ".next",
  ".turbo",
  ".turbopack",
  "dist",
  "build",
];

module.exports = function transformer(file, api) {
  // Skip ignored directories
  if (IGNORED_DIRS.some((dir) => file.path.includes(dir))) {
    return null;
  }

  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, { callee: { name: "logit" } })
    .forEach((callPath) => {
      const args = callPath.value.arguments;

      // Only match 3-argument calls
      if (args.length !== 3) return;

      const [domainArg, eventArg, metaArg] = args;

      if (eventArg.type !== "ObjectExpression") return;

      const payloadProp = eventArg.properties.find(
        (p) => p.key && p.key.name === "payload",
      );

      if (!payloadProp) return;
      if (payloadProp.value.type !== "ObjectExpression") return;

      // Snapshot BEFORE
      const before = j(callPath).toSource();

      // Extract inner payload props
      const innerProps = payloadProp.value.properties;

      // Build new event object (level + message only)
      const newEventProps = eventArg.properties.filter(
        (p) => p.key.name !== "payload",
      );

      const newEventArg = j.objectExpression(newEventProps);

      // Build new payload argument
      const newPayloadArg = j.objectExpression(innerProps);

      // Rewrite call
      callPath.value.arguments = [
        domainArg,
        newEventArg,
        newPayloadArg,
        metaArg,
      ];

      // Snapshot AFTER
      const after = j(callPath).toSource();

      report.push({
        file: file.path,
        before,
        after,
      });
    });

  return root.toSource();
};

process.on("exit", () => {
  const reportPath = path.join(process.cwd(), "logit-migrate-3arg-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`3-arg migration report written to ${reportPath}`);
});
