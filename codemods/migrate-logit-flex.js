/*
 * @FilePath: \my-new-app\codemods\migrate-logit-flex.js
 * @LastEditTime: 2026-03-10 22:59:47
 */
/**
 * Flexible migration for 3-argument logit() calls:
 *
 * From:
 *   logit(domain, { ...fields..., payload: { ... } }, meta)
 *
 * To:
 *   logit(domain, { ...fieldsWithoutPayload... }, { ...payloadProps }, meta)
 *
 * This version:
 *  - Matches ANY object literal containing a `payload` key
 *  - Preserves ALL other event fields (Option A)
 *  - Works with TypeScript + TSX
 *  - Ignores formatting, whitespace, comments, ordering
 *  - Generates a before/after report
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
  if (IGNORED_DIRS.some((dir) => file.path.includes(dir))) {
    return null;
  }

  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, { callee: { name: "logit" } })
    .forEach((callPath) => {
      const args = callPath.value.arguments;

      // Must be exactly 3 args
      if (args.length !== 3) return;

      const [domainArg, eventArg, metaArg] = args;

      // Event must be an object literal
      if (eventArg.type !== "ObjectExpression") return;

      // Find payload property (flexible match)
      const payloadProp = eventArg.properties.find(
        (p) =>
          p.type === "ObjectProperty" &&
          p.key &&
          ((p.key.type === "Identifier" && p.key.name === "payload") ||
            (p.key.type === "StringLiteral" && p.key.value === "payload")),
      );

      if (!payloadProp) return;
      if (payloadProp.value.type !== "ObjectExpression") return;

      // Snapshot BEFORE
      const before = j(callPath).toSource();

      // Extract payload inner props
      const payloadProps = payloadProp.value.properties;

      // Build new event object (remove payload)
      const newEventProps = eventArg.properties.filter(
        (p) => p !== payloadProp,
      );

      const newEventArg = j.objectExpression(newEventProps);

      // Build new payload argument
      const newPayloadArg = j.objectExpression(payloadProps);

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
  const reportPath = path.join(process.cwd(), "logit-migrate-flex-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Flexible logit migration report written to ${reportPath}`);
});
