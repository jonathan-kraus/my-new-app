import {
  Project,
  SyntaxKind,
  CallExpression,
  ObjectLiteralExpression,
} from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: false,
});

const report: any[] = [];

function isObjectLiteral(node: any): node is ObjectLiteralExpression {
  return node && node.getKind() === SyntaxKind.ObjectLiteralExpression;
}

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();

  if (
    filePath.includes("node_modules") ||
    filePath.includes(".next") ||
    filePath.includes(".turbo") ||
    filePath.includes(".turbopack") ||
    filePath.includes("dist") ||
    filePath.includes("build")
  ) {
    continue;
  }

  // PASS 1 — collect all logit() calls
  const logitCalls: CallExpression[] = [];

  for (const call of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression,
  )) {
    const expr = call.getExpression();
    if (expr && expr.getText() === "logit") {
      logitCalls.push(call);
    }
  }

  let modified = false;

  // PASS 2 — safely mutate
  for (const call of logitCalls) {
    const args = call.getArguments();
    const before = call.getText();

    // Already migrated
    if (args.length === 4) continue;

    // Must have at least domain + event
    if (args.length < 2) continue;

    const domainArg = args[0];
    const eventArg = args[1];

    if (!isObjectLiteral(eventArg)) continue;

    // Default payload
    const payloadArg = `{ eventIndex }`;

    // Default meta
    const defaultMeta = `{
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    }`;

    let newMetaArg = defaultMeta;

    // Merge existing meta if present
    if (args.length === 3 && isObjectLiteral(args[2])) {
      const metaObj = args[2] as ObjectLiteralExpression;
      const metaProps = metaObj.getProperties().map((p) => p.getText());

      newMetaArg = `{
        ${metaProps.join(", ")},
        requestId: requestId,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      }`;
    }

    // Replace call
    call.replaceWithText(
      `logit(${domainArg.getText()}, ${eventArg.getText()}, ${payloadArg}, ${newMetaArg})`,
    );

    const after = call.getText();
    report.push({ file: filePath, before, after });
    modified = true;
  }

  if (modified) {
    sourceFile.saveSync();
  }
}

const reportPath = path.join(process.cwd(), "logit-migrate-phase2-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Phase 2 logit migration report written to ${reportPath}`);
