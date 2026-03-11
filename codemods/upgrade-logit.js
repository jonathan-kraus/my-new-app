/*
 * @FilePath: \my-new-app\codemods\upgrade-logit.js
 * @LastEditTime: 2026-03-10 21:59:54
 */
/**
 * Codemod: upgrade old logit(domain, { level, message, payload }, meta)
 *          → logit(domain, { level, message }, payload, meta)
 *
 * Generates a safety report of all changes.
 */

const fs = require("fs");
const path = require("path");

const report = [];

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, {
      callee: { name: "logit" },
    })
    .forEach((pathNode) => {
      const args = pathNode.value.arguments;

      // Must be exactly 3 args
      if (args.length !== 3) {
        report.push({
          file: file.path,
          reason: "Skipped: not 3 arguments",
        });
        return;
      }

      const [domainArg, eventArg, metaArg] = args;

      // eventArg must be an object with level, message, payload
      if (
        eventArg.type !== "ObjectExpression" ||
        !eventArg.properties.some((p) => p.key.name === "level") ||
        !eventArg.properties.some((p) => p.key.name === "message") ||
        !eventArg.properties.some((p) => p.key.name === "payload")
      ) {
        report.push({
          file: file.path,
          reason: "Skipped: event object missing required fields",
        });
        return;
      }

      const levelProp = eventArg.properties.find((p) => p.key.name === "level");
      const messageProp = eventArg.properties.find(
        (p) => p.key.name === "message"
      );
      const payloadProp = eventArg.properties.find(
        (p) => p.key.name === "payload"
      );

      // Build new arguments
      const newEventArg = j.objectExpression([levelProp, messageProp]);
      const newPayloadArg = payloadProp.value;

      // Rewrite call
      pathNode.value.arguments = [
        domainArg,
        newEventArg,
        newPayloadArg,
        metaArg,
      ];

      report.push({
        file: file.path,
        reason: "Rewritten",
        old: j(pathNode).toSource(),
        new: j(pathNode).toSource(),
      });
    });

  return root.toSource();
};

// Write report at the end
process.on("exit", () => {
  const reportPath = path.join(process.cwd(), "logit-migration-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Migration report written to ${reportPath}`);
});
