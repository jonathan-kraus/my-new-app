import {
  Project,
  SyntaxKind,
  ObjectLiteralExpression,
  CallExpression,
} from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: false,
});

const report: any[] = [];

function findPayloadProperty(obj: ObjectLiteralExpression) {
  return obj.getProperty("payload") ?? obj.getProperty('"payload"');
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

  // PASS 2 — mutate safely
  for (const call of logitCalls) {
    const args = call.getArguments();
    if (args.length < 2) continue;

    const domainArg = args[0];
    const eventArg = args[1];
    const metaArg = args[2];

    if (!eventArg || eventArg.getKind() !== SyntaxKind.ObjectLiteralExpression)
      continue;

    const eventObj = eventArg as ObjectLiteralExpression;
    const payloadProp = findPayloadProperty(eventObj);
    if (!payloadProp) continue;

    const before = call.getText();

    const payloadObj = payloadProp.getInitializerIfKind(
      SyntaxKind.ObjectLiteralExpression,
    );
    if (!payloadObj) continue;

    const payloadProps = payloadObj.getProperties().map((p) => p.getText());

    payloadProp.remove();

    const newPayloadArg = `{ ${payloadProps.join(", ")} }`;

    let newMetaArg: string;

    if (metaArg && metaArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
      const metaProps = (metaArg as ObjectLiteralExpression)
        .getProperties()
        .map((p) => p.getText());

      newMetaArg = `{
        ${metaProps.join(", ")},
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      }`;
    } else {
      newMetaArg = `{
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      }`;
    }

    call.replaceWithText(
      `logit(${domainArg.getText()}, ${eventObj.getText()}, ${newPayloadArg}, ${newMetaArg})`,
    );

    const after = call.getText();

    report.push({ file: filePath, before, after });
    modified = true;
  }

  if (modified) {
    sourceFile.saveSync();
  }
}

const reportPath = path.join(
  process.cwd(),
  "logit-migrate-tsmorph-report.json",
);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`ts-morph logit migration report written to ${reportPath}`);
