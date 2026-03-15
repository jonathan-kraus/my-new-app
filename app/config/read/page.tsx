
/* @FilePath: \my-new-app\app\config\read\page.tsx
* @LastEditTime: 2026-03-14 22:50:26
*/

import { queryAxiom } from "@/lib/axiom/query";
import { logit } from "@/lib/log/logit";

export default async function AxiomTestPage() {
  const requestId = crypto.randomUUID();
  const userId = "JK";
  const eventIndex = 22;
console.log("In config read");

  // --- Log the combined result --------------------------------------------
  await logit(
    "jonathan",
    { level: "info", message: "In config read" },
    {
      firstData: "firstData",
      secondData: "secondData",

    },
    {
      page: "page.tsx",
      requestId,
      userId,
      eventIndex,
    },
  );
async function GET() {
  const q = `
['github-events']
| where firstData.reason == "Flight"
| sort by _time desc
| project firstData.Variable01, firstData.Variable02, firstData.Variable03
| take 1
`;

  const res = await queryAxiom(q);
  await logit(
    "jonathan",
    { level: "info", message: "Read config data from axiom" },
    {
      firstData: "firstData",
      secondData: "secondData",
      res: res,

    },
    {
      page: "page.tsx",
      requestId,
      userId,
      eventIndex,
    },
  );
  console.log("In config read", res);


  return Response.json(res);
}



// --- show config data  --------------------------------------------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold mb-4">Result</h1>
      firstData.Variable01
      <br />
      firstData.Variable02
      <br />
      firstData.Variable03
      <br />

      secondData.Variable01
      <br />
      secondData.Variable02
      <br />
      secondData.Variable03
      <br />
      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">

      End
      </pre>
    </div>
  );
}
