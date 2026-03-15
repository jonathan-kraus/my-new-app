import { queryAxiom } from "@/lib/axiom/query";

export default async function ConfigReadPage() {
  const q = `
['github-events']
| where reason == "Flight"
| sort by _time desc
| project
    Variable01,
    Variable02,
    Variable03
| take 1
`;

  const rows = await queryAxiom(q) as Array<{
    Variable01: string
    Variable02: string
    Variable03: string
  }>;

  const data = rows[0];

  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Data</h1>

      {data ? (
        <>
          <div>{data.Variable01}</div>
          <div>{data.Variable02}</div>
          <div>{data.Variable03}</div>

          {/* placeholders for secondData if you want later */}
          <div>—</div>
          <div>—</div>
          <div>—</div>
        </>
      ) : (
        <div>No config found.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
