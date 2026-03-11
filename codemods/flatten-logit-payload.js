/*
 * @FilePath: \my-new-app\codemods\flatten-logit-payload.js
 * @LastEditTime: 2026-03-10 22:37:11
 */
/**
 * Codemod: flatten old logit payload:
 *
 *   logit("x", { level, message, payload: { a, b } })
 * → logit("x", { level, message, a, b })
 *
 * Generates a safety report.
 */

const fs = require("fs");
const path = require("path");

const report = [];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, { callee: { name: "logit" } })
    .forEach((callPath) => {
      const args = callPath.value.arguments;

      if (args.length < 2) {
        report.push({ file: file.path, reason: "Skipped: <2 args" });
        return;
      }

      const eventArg = args[1];

      if (eventArg.type !== "ObjectExpression") {
        report.push({ file: file.path, reason: "Skipped: event not object" });
        return;
      }

      const payloadProp = eventArg.properties.find(
        (p) => p.key && p.key.name === "payload",
      );

      if (!payloadProp) {
        report.push({ file: file.path, reason: "Skipped: no payload prop" });
        return;
      }

      if (payloadProp.value.type !== "ObjectExpression") {
        report.push({
          file: file.path,
          reason: "Skipped: payload not object literal",
        });
        return;
      }

      // Extract inner payload properties
      const innerProps = payloadProp.value.properties;

      // Remove the payload property
      eventArg.properties = eventArg.properties.filter(
        (p) => p !== payloadProp,
      );

      // Add inner properties to the event object
      eventArg.properties.push(...innerProps);

      report.push({
        file: file.path,
        reason: "Flattened payload",
        before: j(callPath).toSource(),
        after: j(callPath).toSource(),
      });
    });

  return root.toSource();
};

process.on("exit", () => {
  const reportPath = path.join(
    process.cwd(),
    "logit-payload-flatten-report.json",
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Payload flatten report written to ${reportPath}`);
});
