export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, { callee: { name: "logit" } })
    .forEach(path => {
      const args = path.value.arguments;

      // Only transform logit({ ... })
      if (args.length !== 1) return;
      const first = args[0];
      if (!j.ObjectExpression.check(first)) return;

      const props = first.properties;
      if (!Array.isArray(props)) return;

      let domainProp = null;
      let metaProp = null;
      const payloadProps = [];

      for (const p of props) {
        if (!p.key || !p.key.name) continue;

        const key = p.key.name;

        if (key === "domain") {
          domainProp = p.value;
        } else if (key === "meta") {
          metaProp = p.value;
        } else {
          payloadProps.push(p);
        }
      }

      // If no domain, skip
      if (!domainProp) return;

      const newArgs = [
        domainProp,
        j.objectExpression(payloadProps),
      ];

      if (metaProp) {
        newArgs.push(metaProp);
      }

      path.value.arguments = newArgs;
    });

  return root.toSource({ quote: "double" });
}
